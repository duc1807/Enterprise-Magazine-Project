const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const fs = require("fs");

// Import multer upload function
const { upload } = require("../utils/multerStorage");

// Import database services
const {
  addNewCommentToArticle,
  setSelectedArticle,
  getEventByArticleId,
  setPendingArticle,
  setRejectedArticle,
  getArticleDetailById,
  getFileAndCommentByFileId,
  getSelfArticles,
  getArticleById,
  createPostedArticle,
  uploadFile,
  deleteFileByFileId,
  setArticleCommentOntime,
  getArticleInformationById,
  getCommentByArticleId,
  getFileDetailById,
  createPostedArticleImages,
  getPostedArticleById,
} = require("../utils/dbService/index");
const {
  moveFolderToOtherFolder,
  getAuthServiceJwt,
  deleteFileOnDrive,
} = require("../utils/driveAPI");
const {
  gwAccountValidation,
  coordinatorValidation,
} = require("./middleware/verification");

// Constants
const _COORDINATOR_ROLE_ID = 2;
const _STUDENT_ROLE_ID = 1;
const POSTED_ARTICLE_IMAGE_STORAGE = "1Fy9FIpJKDenMEp7n5nI01eeRhXZgtcK_";

/**
 * @method GET
 * @API /api/article/my-articles/
 * @permission
 *    - Student
 * @description API for getting student's articles information
 * @params
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - myArticles: Array[Object]
 * @notes
 *    - Need endDate2
 */
router.get("/my-articles", gwAccountValidation, async (req, res) => {
  // Get userInfo passed from middleware
  const data = res.locals.data;

  console.log("data: ", data);

  // Get all articles list of current user
  const query = getSelfArticles(data.userInfo.account_id);

  await query
    .then((result) => {
      // Finally, response the selectedArticles[]
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        myArticles: result,
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      } else {
        // If err == false => Event not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Not found",
        });
      }
    });
});

/**
 * @method GET
 * @API api/article/:articleId/
 * @permission
 *    - Student (exact articleId)
 *    - Coordinator
 * @description API for getting an article information (with files and comments)
 * @params
 * 		- articleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - article: Object
 * @notes
 *    - Not yet validation coordinator with exact faculty ??? Is coordinator need this API ??? Already have another API
 *    - if needed, can get article JOIN account_submission => then check coordinator faculty with account_submission faculty
 */
router.get("/:articleId", gwAccountValidation, async (req, res) => {
  // Get articleId from params
  const { articleId } = req.params;

  // Get userInfo passed from middleware
  const data = res.locals.data;

  // Promise to check user role is student or coordinator
  const roleValidation = new Promise((resolve, reject) => {
    // If role is "student", check if student has permission to get this article
    if (data.userInfo.FK_role_id != _COORDINATOR_ROLE_ID) {
      // Get article by id and student_id to check if student has permission to access the article
      getArticleById(articleId, data.userInfo.account_id)
        .then((result) => {
          resolve();
        })
        .catch((err) => {
          if (!!err) {
            console.log("Err: ", err);
            return res.status(500).json({
              status: res.statusCode,
              success: false,
              message: "Server error",
            });
          } else {
            return res.status(401).json({
              status: res.statusCode,
              success: false,
              messsage: "Permission required",
            });
          }
        });
    } else {
      resolve();
    }
  });

  roleValidation.then(async () => {
    // Get article information (with files & comments)
    const query = getArticleDetailById(articleId);

    await query
      .then((result) => {
        // result[0] : article and its files
        // result[1] : article and its comments
        console.log("result: ", result);

        // Create array to store final data to return to frontend
        let articlesResult = [];

        // Create array for storing distinc iterated article_id
        let passedArticlesId = [];

        // Create Object for storing the article's position in 'articlesResult[]' for searching optimization
        let articlesPositionDetail = {};

        // Itarate each data in result[0]
        result[0].map((articleInfo) => {
          // Check if this article is exist in 'articlesResult' array or not
          if (passedArticlesId.includes(articleInfo.article_id)) {
            // If this article existed in 'articlesResult' array, push its file into 'article.files'

            // Get position of the article in 'articlesResult[]'
            let articlePosition =
              articlesPositionDetail[articleInfo.article_folderId];
            console.log("position: ", articlePosition);

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Insert file Object to its article in 'articlesResult[]'
            articlesResult[articlePosition].files.push(file);
          } else {
            // If this article not exist, push the article_id into 'passedArticlesId'
            passedArticlesId.push(articleInfo.article_id);

            // Create article Object to store information from result
            let article = {
              article_id: articleInfo.article_id,
              article_submission_date: articleInfo.article_submission_date,
              article_status: articleInfo.article_status,
              article_folderId: articleInfo.article_folderId,
              email: articleInfo.email,
              FK_faculty_id: articleInfo.FK_faculty_id,
              FK_account_id: articleInfo.FK_account_id,
              FK_event_id: articleInfo.FK_event_id,
              files: [],
              comments: [],
            };

            // Create file Object to store file information
            let file = {
              file_id: articleInfo.file_id,
              file_mimeType: articleInfo.file_mimeType,
              file_name: articleInfo.file_name,
              file_fileId: articleInfo.file_fileId,
              FK_article_id: articleInfo.FK_article_id,
            };

            // Push file Object into 'article.files' (only in first-time run)
            article.files.push(file);

            // Finally, push article information into 'articlesResult[]'
            articlesResult.push(article);

            // Storing article position in Object (key: articleFolderId, value: position in 'articlesResult[]')
            articlesPositionDetail[articleInfo.article_folderId] =
              articlesResult.length - 1;
          }
        });

        // Itarate each data in result[1]
        result[1].map((articleInfo) => {
          // Get position of the article in 'articlesResult[]'
          let articlePosition =
            articlesPositionDetail[articleInfo.article_folderId];
          console.log("position: ", articlePosition);

          // Create file Object to store file information
          let comment = {
            comment_id: articleInfo.comment_id,
            comment_time: articleInfo.comment_time,
            comment_content: articleInfo.comment_content,
            FK_article_id: articleInfo.FK_article_id,
            FK_account_id: articleInfo.FK_account_id,
          };

          // Insert file Object to its article in 'articlesResult[]'
          articlesResult[articlePosition].comments.push(comment);
        });

        // Finally, response the selectedArticles[]
        res.status(200).json({
          status: res.statusCode,
          success: true,
          article: articlesResult,
        });
      })
      .catch((err) => {
        if (err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        } else {
          // If err == false => Event not found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Event not found",
          });
        }
      });
  });
});

/**
 * @method GET
 * @API /api/article/:articleId/file/:fileId/        ?????????????
 * @permission
 *    - Manager coordinator of exact faculty
 * @description API for getting article's .doc file information & comments
 * @params
 *    - articleId: Int
 * 		- fileId: Int
 * @return
 *
 *    - file: Object
 *    - comments: Array[Object]
 * @notes
 *    - Not yet validate permission
 *    - Replace ??? Dont need !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
router.get(
  "/:articleId/file/:fileId",
  coordinatorValidation,
  async (req, res) => {
    // Get articleId from params
    const { articleId, fileId } = req.params;

    // Get userInfo passed from middleware
    const data = res.locals.data;

    // Get files and comments by fileId and articleId
    const query = getFileAndCommentByFileId(fileId, articleId);

    await query
      .then(async (result) => {
        // Initialize drive service
        const jwToken = await getAuthServiceJwt();
        const drive = google.drive({
          version: "v3",
          auth: jwToken,
        });

        console.log("result: ", result);

        // Assignn result to variables
        const file = result[0][0]; // Because the file is only 1, so get the Object data at position 0
        const comments = result[1];

        // Finally, response the selectedArticles[]
        return res.status(200).json({
          status: res.statusCode,
          success: true,
          file: file,
          comments: comments,
        });
      })
      .catch((err) => {
        if (err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        } else {
          // If err == false => Event not found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Not found",
          });
        }
      });
  }
);

/**
 * @method GET
 * @API /api/article/:articleId/comments/
 * @permission
 *    - Manager coordinator of exact faculty
 * @description API for getting an article's comments
 * @params
 * 		- articleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - comments: Array[Object]
 * @notes
 */
router.get("/:articleId/comments", gwAccountValidation, async (req, res) => {
  // Get articleId from params
  const { articleId } = req.params;

  // Get userInfo passed from middleware
  const data = res.locals.data;

  // Get files and comments by fileId and articleId
  const query = getCommentByArticleId(articleId);

  await query
    .then(async (result) => {
      // Finally, response the comments[]
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        comments: result,
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        message: "Bad request",
      });
    });
});

/**
 * @method DELETE
 * @API /api/article/:articleId/file/:fileId/
 * @permission
 *    - Student with exact articleId
 * @description API for deleting a file of an article
 * @params
 *    - articleId: Int
 * 		- fileId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 * @notes
 *    - Dont need articleId ?????
 */
router.delete(
  "/:articleId/file/:fileId",
  gwAccountValidation,
  async (req, res) => {
    // Get articleId from params
    const { articleId, fileId } = req.params;

    // Get userInfo passed from middleware
    const data = res.locals.data;

    // Check if user is student or not

    // Get file information
    const query = getFileDetailById(fileId);

    query
      .then(async (result) => {
        // Get files and comments by fileId and articleId
        const query1 = deleteFileByFileId(fileId, data.userInfo.account_id);

        await query1
          .then(async (result1) => {
            // Delete file on Google Drive
            deleteFileOnDrive(result[0].file_fileId);
            return res.status(200).json({
              status: res.statusCode,
              success: true,
              message: "File removed",
            });
          })
          .catch((err) => {
            if (err) {
              console.log("Err: ", err);
              return res.status(501).json({
                status: res.statusCode,
                success: false,
                message: "Bad request",
              });
            } else {
              // If err == false => Event not found
              return res.status(404).json({
                status: res.statusCode,
                success: false,
                message: "Not found",
              });
            }
          });
      })
      .catch((err) => {
        console.log("Err: ", err);
      });
  }
);

/**
 * @method POST
 * @API api/article/:articleId/comments/
 * @description API for adding new comment to the article
 * @params
 *    - articleId: Int
 * 		- content: String (comment)
 * @return null
 * @notes
 *    - (!!! CORS problems)
 */
router.post("/:articleId/comments", gwAccountValidation, async (req, res) => {
  // Get comment content
  const { content } = req.body;
  // Get articleId from params
  const { articleId } = req.params;

  // Get userInfo passed from middleware
  const data = res.locals.data;

  // Check permission is coordinator or not
  if (data.userInfo.FK_role_id != _COORDINATOR_ROLE_ID) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Permission required!",
    });
  }

  // Log the data for testing
  console.log("data: ", data);

  // Get the current time
  const currentTime = new Date();

  // Create comment data to INSERT into database
  const commentData = {
    content: content,
    time: currentTime.getTime(),
    FK_article_id: articleId,
    FK_account_id: data.userInfo.account_id,
  };

  // Await database query
  await addNewCommentToArticle(commentData, data.userInfo)
    .then(async (result) => {
      await getArticleInformationById(articleId)
        .then((result1) => {
          console.log(result1);
          // Get defalt article at position[0]
          console.log(result1[0].article_submission_date);
          const articleSubmittedDate = result1[0].article_submission_date;
          const commentOntime = result1[0].comment_onTime;

          // If commentOntime == null
          // => If comment time < articleSubmissionDate + 14 days
          // => update Article.comment_onTime = true/false
          if (commentOntime == null) {
            if (currentTime.getTime() < articleSubmittedDate + 1209600000) {
              setArticleCommentOntime(articleId, true)
                .then((result2) => {
                  return res.status(201).json({
                    status: res.statusCode,
                    success: true,
                    commentInfo: commentData,
                  });
                })
                .catch((err) => {
                  console.log("Err: ", err);
                  return res.status(501).json({
                    status: res.statusCode,
                    success: false,
                    messages: "Bad request",
                  });
                });
            } else {
              setArticleCommentOntime(articleId, false)
                .then((result3) => {
                  return res.status(201).json({
                    status: res.statusCode,
                    success: true,
                    commentInfo: commentData,
                  });
                })
                .catch((err) => {
                  console.log("Err: ", err);
                  return res.status(501).json({
                    status: res.statusCode,
                    success: false,
                    messages: "Bad request",
                  });
                });
            }
          } else {
            return res.status(201).json({
              status: res.statusCode,
              success: true,
              commentInfo: commentData,
            });
          }
        })
        .catch((err) => {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        });
    })
    .catch((err) => {
      if (!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If article doesnt exist or permission invalid
        return res.status(401).json({
          status: res.statusCode,
          success: false,
          message: "Invalid request!",
        });
      }
    });
});

/**
 * @method PATCH
 * @API /api/article/:articleId/select/
 * @description API for select an article
 * @params
 * 		- articleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 * @notes
 *    - Still not validate permission
 */
router.patch("/:articleId/select", gwAccountValidation, async (req, res) => {
  // Get articleId from param
  const { articleId } = req.params;
  // Get userInfo passed from middleware
  const data = res.locals.data;

  // Check permission is coordinator or not
  if (data.userInfo.FK_role_id != _COORDINATOR_ROLE_ID) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Permission required!",
    });
  }

  // Set article status to selected in database
  const query = setSelectedArticle(articleId);

  await query
    .then(async (result) => {
      // If updated successfully, the get event information by articleId
      const query1 = getEventByArticleId(articleId);

      // After getting event information successfully, then alter folder in google drive
      await query1
        .then((articleAndEventInfo) => {
          console.log(articleAndEventInfo);

          // Asynchronous move article folder to selected article in Drive
          moveFolderToOtherFolder(articleAndEventInfo);

          // Return the success status
          return res.status(204).json({
            status: res.statusCode,
            success: true,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        });
    })
    .catch((err) => {
      if (!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          messages: "Bad request",
        });
      } else {
        // If article || article status == 'pending' doesnt exist
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Invalid request!",
        });
      }
    });
});

/**
 * @method PATCH
 * @API /api/article/:articleId/reject
 * @description API for reject an article
 * @params
 * 		- articleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 * @notes
 */
router.patch("/:articleId/reject", gwAccountValidation, async (req, res) => {
  // Get articleId from req.params
  const { articleId } = req.params;

  console.log("ARTICLEID: ", articleId);

  // Get the userInfo passed from middleware
  const data = res.locals.data;

  console.log("DATA USERINFO: ", data);

  // Check if user has permisson to this api or not
  if (data.userInfo.FK_role_id != _COORDINATOR_ROLE_ID) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Permission required!",
    });
  }

  // Set article status to rejected
  const query = setRejectedArticle(articleId);

  await query
    .then((result) => {
      return res.status(204).json({
        status: res.statusCode,
        success: true,
        message: `Article ${articleId} has been rejected`,
      });
    })
    .catch((err) => {
      if (!!err) {
        console.log(err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request!",
        });
      } else {
        // Check if article || article status == 'pending' doesnt exist
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Invalid request!",
        });
      }
    });
});

/**
 * @method POST
 * @API /api/article/post-article/:eventId/
 * @permission
 *    - Coordinator (Exact faculty)
 * @description API for post article to event homepage
 * @params
 * 		- title: String
 * 		- content: String
 * 		- author: String (email)
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 * @notes
 */
router.post(
  "/post-article/:eventId",
  gwAccountValidation,
  upload.any("file"),
  async (req, res) => {
    // Get information from param
    const { eventId } = req.params;
    // Get data from req.body
    const { title, content, author } = JSON.parse(req.body.newPost);

    // Get userInfo passed from middleware
    const data = res.locals.data;

    // Check permission is coordinator or not
    if (data.userInfo.FK_role_id != _COORDINATOR_ROLE_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Permission required!",
      });
    }

    // Get current time
    const currentTime = new Date();
    // Create article Object to INSERT INTO database
    const article = {
      title: title,
      content: content,
      author: author,
      postedDate: currentTime.getTime(),
      eventId: eventId,
    };

    // INSERT article into 'Posted_Article' table
    const query = createPostedArticle(article, data.userInfo.FK_faculty_id);

    await query
      .then(async(result) => {
        // Get posted_article id
        const postedArticleId = result.insertId;

        // Upload images to drive public "Posted Article Image" folder
        // Upload into new folder: ${currentTime} | ${article.title} ${index + 1}
        // Then INSERT uploaded images information to PA_Image

        const jwToken = await getAuthServiceJwt();
        const drive = google.drive({
          version: "v3",
          auth: jwToken,
        });

        // Get files[] from request
        const files = req.files;

        let filesId = [];

        // Map all elements in files
        files.map((filedata, index) => {
          // Create metadata for file
          const filemetadata = {
            name: `${currentTime.getTime()} | ${article.title} ${index + 1}`,
            parents: [POSTED_ARTICLE_IMAGE_STORAGE],
          };

          // Create media type for file
          const media = {
            mimeType: filedata.mimetype,
            body: fs.createReadStream(filedata.path),
          };

          // Upload file to google drive
          drive.files.create(
            {
              resource: filemetadata,
              media: media,
              fields: "id",
            },
            async (err, file) => {
              if (err) {
                res.json({
                  status: 501,
                  success: false,
                  message: "Upload files to drive failed!",
                });
                fs.unlinkSync(filedata.path);
                return;
              }

              // STEP 8: Get the file id after uploaded successful
              console.log("File id: ", file.data.id);
              filesId.push(file.data.id);

              fs.unlinkSync(filedata.path);

              // INSERT files list id into database PA_Image
              // Check if all files uploaded
              if (filesId.length == files.length) {
                createPostedArticleImages(filesId, postedArticleId)
                  .then((result) => {
                    return res.status(201).json({
                      status: res.statusCode,
                      success: true,
                      message: "New article posted successfully",
                    });
                  })
                  .catch((err) => {
                    console.log("Err", err);
                    return res.status(501).json({
                      status: res.statusCode,
                      success: false,
                      message:
                        "Server error when upload posted-article's images",
                    });
                  });
              }
            }
          );
        });
      })
      .catch((err) => {
        if (!!err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        } else {
          // If event not exist || permission to event is invalid
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Invalid request!",
          });
        }
      });
  }
);

/**
 * @method GET
 * @API /api/article/posted/:postedArticleId/
 * @permission
 *    - Anyone
 * @description API for getting posted article
 * @params
 * 		- postedArticleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - article: Object
 * @notes
 */
router.get("/posted/:postedArticleId", async (req, res) => {
  // Get articleId from params
  const { postedArticleId } = req.params;

  // Get files and comments by fileId and articleId
  const query = getPostedArticleById(postedArticleId);

  await query
    .then((postedArticles) => {
      // Finally, response the posted article information
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        article: postedArticles[0],
      });
    })
    .catch((err) => {
      if (!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      } else {
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Not found",
        });
      }
    });
});

/**
 * @method PUT
 * @API /api/article/:articleId/update-submission/
 * @description API for student to update submitted articles and then return articleInfo (with files and comments)    ????????
 * @params
 * 		- articleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - article: Object
 * @notes
 */
router.put(
  "/:articleId/update-submission",
  gwAccountValidation,
  async (req, res) => {
    // Get the userInfo passed from middleware
    const data = res.locals.data;

    // Get articleId from req.params and initialize facultyId
    const { articleId } = req.params;
    const facultyId = data.userInfo.FK_faculty_id;

    // Initialize the articleResult to hold the result return from query
    let articleResult = undefined;
    // Create filesArray[] to store files information
    let filesArray = [];

    // Check if user has permisson to the article or not
    if (data.userInfo.FK_role_id != _STUDENT_ROLE_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Permission required!",
      });
    }

    // Get article information by 'article_id' and User 'account_id'
    const query = getArticleById(articleId, data.userInfo.account_id);

    await query
      .then((result) => {
        console.log("res: ", result);
        // Get the article at the position 0 (Bcs only 1 article found)
        articleResult = result[0];
      })
      .catch((err) => {
        if (!!err) {
          console.log(err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request!",
          });
        } else {
          // Check if article submitted by current user doesnt exist
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Invalid request!",
          });
        }
      });

    // Initialize google auth service
    const jwToken = await getAuthServiceJwt();
    const drive = google.drive({
      version: "v3",
      auth: jwToken,
    });

    // Upload files into article submission folder from query result (articleResult{})

    // Get multer storage upload function
    const uploadMultiple = upload.any("uploadedImages");

    // Upload file function
    uploadMultiple(req, res, function (err) {
      if (err) throw err;
      console.log("files: ", req.files);

      const files = req.files;

      // Create file metadata
      files.map((filedata, index) => {
        const filemetadata = {
          name: filedata.filename,
          parents: [articleResult.article_folderId],
        };

        // Create media type for file
        const media = {
          mimeType: filedata.mimetype,
          body: fs.createReadStream(filedata.path),
        };

        // Upload file to google drive
        drive.files.create(
          {
            resource: filemetadata,
            media: media,
            fields: "id",
          },
          async (err, file) => {
            if (err) {
              res.json({
                status: 501,
                success: false,
                message: "Upload files to drive failed!",
              });
              fs.unlinkSync(filedata.path);
            }

            // STEP 8: Get the file id and create fileInfo Object
            const fileInfo = {
              mimeType: filedata.mimetype,
              fileName: filedata.originalname,
              fileId: file.data.id,
              FK_article_id: articleResult.article_id, // ??? Using articleFolderId or unique id??
            };

            // Push files into filesArray[]
            filesArray.push(fileInfo);
            // Check if all files have been pushed into filesArray[]
            // If true, get all the files and comments of current article and return
            if (filesArray.length == files.length) {
              // INSERT new file into database 'File'
              const query2 = uploadFile(filesArray);

              await query2
                .then(async (result2) => {
                  console.log(filedata.filename + " uploaded successfully");

                  // Check if the last file is INSERT into database or not
                  // If all file inserted, return article
                  if (index == files.length - 1) {
                    // Get all files and comments of current article
                    const query4 = getArticleDetailById(articleId);

                    await query4
                      .then((result) => {
                        // result[0] : article and its files
                        // result[1] : article and its comments
                        console.log("result: ", result);

                        // Create array to store final data to return to frontend
                        let articlesResult = [];

                        // Create array for storing distinc iterated article_id
                        let passedArticlesId = [];

                        // Create Object for storing the article's position in 'articlesResult[]' for searching optimization
                        let articlesPositionDetail = {};

                        // Itarate each data in result[0] (article files)
                        result[0].map((articleInfo) => {
                          // Check if this article is exist in 'articlesResult' array or not
                          if (
                            passedArticlesId.includes(articleInfo.article_id)
                          ) {
                            // If this article existed in 'articlesResult' array, push its file into 'article.files'

                            // Get position of the article in 'articlesResult[]'
                            let articlePosition =
                              articlesPositionDetail[
                                articleInfo.article_folderId
                              ];
                            console.log("position: ", articlePosition);

                            // Create file Object to store file information
                            let file = {
                              file_id: articleInfo.file_id,
                              file_mimeType: articleInfo.file_mimeType,
                              file_name: articleInfo.file_name,
                              file_fileId: articleInfo.file_fileId,
                              FK_article_id: articleInfo.FK_article_id,
                            };

                            // Insert file Object to its article in 'articlesResult[]'
                            articlesResult[articlePosition].files.push(file);
                          } else {
                            // If this article not exist, push the article_id into 'passedArticlesId'
                            passedArticlesId.push(articleInfo.article_id);

                            // Create article Object to store information from result
                            let article = {
                              article_id: articleInfo.article_id,
                              article_submission_date:
                                articleInfo.article_submission_date,
                              article_status: articleInfo.article_status,
                              article_folderId: articleInfo.article_folderId,
                              email: articleInfo.email,
                              FK_faculty_id: articleInfo.FK_faculty_id,
                              FK_account_id: articleInfo.FK_account_id,
                              FK_event_id: articleInfo.FK_event_id,
                              files: [],
                              comments: [],
                            };

                            // Create file Object to store file information
                            let file = {
                              file_id: articleInfo.file_id,
                              file_mimeType: articleInfo.file_mimeType,
                              file_name: articleInfo.file_name,
                              file_fileId: articleInfo.file_fileId,
                              FK_article_id: articleInfo.FK_article_id,
                            };

                            // Push file Object into 'article.files' (only in first-time run)
                            article.files.push(file);

                            // Finally, push article information into 'articlesResult[]'
                            articlesResult.push(article);

                            // Storing article position in Object (key: articleFolderId, value: position in 'articlesResult[]')
                            articlesPositionDetail[
                              articleInfo.article_folderId
                            ] = articlesResult.length - 1;
                          }
                        });

                        // Itarate each data in result[1] (article comments)
                        result[1].map((articleInfo) => {
                          // Get position of the article in 'articlesResult[]'
                          let articlePosition =
                            articlesPositionDetail[
                              articleInfo.article_folderId
                            ];
                          console.log("position: ", articlePosition);

                          // Create comment Object to store comment information
                          let comment = {
                            comment_id: articleInfo.comment_id,
                            comment_time: articleInfo.comment_time,
                            comment_content: articleInfo.comment_content,
                            FK_article_id: articleInfo.FK_article_id,
                            FK_account_id: articleInfo.FK_account_id,
                          };

                          // Insert comment Object to its article in 'articlesResult[]'
                          articlesResult[articlePosition].comments.push(
                            comment
                          );
                        });

                        // Finally, response the articleInfo {}
                        return res.status(200).json({
                          status: res.statusCode,
                          success: true,
                          article: articlesResult,
                        });
                      })
                      .catch((err) => {
                        if (err) {
                          console.log("Err: ", err);
                          return res.status(501).json({
                            status: res.statusCode,
                            success: false,
                            message: "Bad request",
                          });
                        } else {
                          // If err == false => Event not found
                          return res.status(404).json({
                            status: res.statusCode,
                            success: false,
                            message: "Event not found",
                          });
                        }
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  // Return err
                  return res.status(500).json({
                    status: res.statusCode,
                    success: false,
                    message: "Error when uploading files",
                  });
                });
            }
            // Delete the file in temp folder
            fs.unlinkSync(filedata.path);
          }
        );
      });
    });

    // Set article status to pending and update time
    const query3 = setPendingArticle(articleResult.article_id);

    await query3
      .then((result3) => {
        console.log("Article status set to pending");
      })
      .catch((err) => {
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request!",
        });
      });
  }
);

module.exports = router;
