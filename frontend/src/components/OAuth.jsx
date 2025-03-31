import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      provider.setCustomParameters({
        prompt: 'select_account',
        display: 'popup'
      });

      const result = await signInWithPopup(auth, provider);

      const res = await fetch('/server/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/scan-receipt');
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };
  return (
    <div className="flex justify-center items-center mt-4">
      <FcGoogle 
        size={30}
        className='cursor-pointer hover:opacity-80 transition-opacity'
        onClick={handleGoogleClick}
        role="button"
        aria-label="Sign in with Google"
        style={{ cursor: 'pointer' }} 
      />
      <div className="w-24 h-px bg-gradient-to-l from-transparent to-gray-300 black"></div>
    </div>
  );
}