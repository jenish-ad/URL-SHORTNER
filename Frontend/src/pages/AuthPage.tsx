import { useState } from "react";

import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

const AuthPage = () => {
  const [login, setLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {login ? (
        <LoginForm onSwitchMode={setLogin} />
      ) : (
        <RegisterForm onSwitchMode={setLogin} />
      )}
    </div>
  );
};

export default AuthPage;
