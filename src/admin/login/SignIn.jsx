import {signInWithGooglePopup} from './firebase.utils'

const SignIn = () => {
const logGoogleUser = async () => {
        const response = await signInWithGooglePopup();
        console.log(response);
    }
return (
        <div>
            <button onClick={logGoogleUser}>Sign In With Google</button>
        </div>
    )
}
export default SignIn;