import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const header = () => {
    return (
        <div className="flex m-5 gap-5">
            <SignedOut>
                <SignInButton />
                <SignUpButton />
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    );
};

export default header;
