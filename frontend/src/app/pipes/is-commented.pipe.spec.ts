import { IsCommentedPipe } from './is-commented.pipe';

describe('IsCommentedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsCommentedPipe();
    expect(pipe).toBeTruthy();
  });
});
