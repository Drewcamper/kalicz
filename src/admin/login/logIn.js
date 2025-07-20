import { signInWithGooglePopup } from '../firebase.utils';
import { toast } from 'react-toastify';

const logGoogleUser = user => {
  try {
    toast(`Welcome ${user}!`);
  } catch (error) {
    throw new Error('Error logging Google user:', error);
  }
};

const authAdmin = userEmail => {
  if (userEmail === 'drewcamperdev@gmail.com' || userEmail === 'matekalicz@gmail.com') {
    return true;
  }
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
      toast('User is not authorized');
      return false;
    }
  } catch (error) {
    toast('Error during login process:', error);
    return false;
  }
};
