import { RoleNamePipe } from './role-name.pipe';

describe('RoleNamePipe', () => {
  it('create an instance', () => {
    const pipe = new RoleNamePipe();
    expect(pipe).toBeTruthy();
  });
});
