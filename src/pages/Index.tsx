import { useState } from "react";
import { UserInfoForm } from "@/components/UserInfoForm";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  const handleUserInfoSubmit = (name: string, email: string) => {
    setUserInfo({ name, email });
  };

  if (!userInfo) {
    return <UserInfoForm onSubmit={handleUserInfoSubmit} />;
  }

  return <ChatInterface userName={userInfo.name} userEmail={userInfo.email} />;
};

export default Index;
