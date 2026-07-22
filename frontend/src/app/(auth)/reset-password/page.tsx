
import { Suspense } from "react";
import Spinner from "@/app/ui/spinner/Spinner";
import ResetPasswordForm from "./ResetPasswordForm";

export default function Page() {
    return (
        <Suspense fallback={<Spinner />}>
            <ResetPasswordForm />
        </Suspense>
    );
}