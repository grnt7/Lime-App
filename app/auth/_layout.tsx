import { Redirect, Slot } from "expo-router"
import { useAuth } from "~/providers/AuthProvider";

export default function AuthLayout() {
    const {isAuthenticated} = useAuth();
    console.log("isAuthenticated: ", isAuthenticated);

    if (isAuthenticated) {
        return <Redirect href="/" />;
    }

   return <Slot />;
    
}