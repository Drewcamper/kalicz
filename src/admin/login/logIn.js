import { signInWithGooglePopup } from '../firebase.utils';

const logGoogleUser = user => {
  try {
    console.log(user);
  } catch (error) {
    console.error('Error logging Google user:', error);
  }
};

const authAdmin = userEmail => {
  if (userEmail === 'drewcamperdev@gmail.com') {
    console.log(userEmail);
    return true;
  }
  console.log(userEmail);
  return false;
};

export const login = async () => {
  try {
    const response = await signInWithGooglePopup();
    const userEmail = response.user.email;

    if (authAdmin(userEmail)) {
      logGoogleUser(response.user);
      return true;
    } else {
      console.log('User is not authorized');
      return false;
    }
  } catch (error) {
    console.error('Error during login process:', error);
    return false;
  }
};
