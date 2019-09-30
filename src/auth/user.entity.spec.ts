import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('User entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    bcrypt.compareSync = jest.fn();
  });

  describe('validatePassword', () => {
    it('returns true as password is valid', async () => {
      bcrypt.compareSync.mockReturnValue(true);
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.compareSync).toHaveBeenCalledWith('123456', 'testPassword');
      expect(result).toEqual(true);
    });

    it('returns false as password is invalid', async () => {
      bcrypt.compareSync.mockReturnValue(false);
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      const result = await user.validatePassword('wrongPassword');
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        'wrongPassword',
        'testPassword',
      );
      expect(result).toEqual(false);
    });
  });
});
