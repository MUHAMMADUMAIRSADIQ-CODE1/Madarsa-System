import { useNavigate } from 'react-router-dom';
import LoginLeftSide from '../../components/Auth/LoginLeftSide';
import LoginForm from '../../components/Auth/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-24 flex flex-col lg:flex-row">
      {/* Left Side */}
      <LoginLeftSide />

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-8 lg:py-0">
        <LoginForm onSignupClick={handleSignupClick} />
      </div>
    </div>
  );
}
