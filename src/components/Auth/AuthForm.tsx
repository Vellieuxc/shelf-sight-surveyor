
import React, { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthForm: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <SignIn />
        </TabsContent>
        <TabsContent value="signup">
          <SignUp />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
