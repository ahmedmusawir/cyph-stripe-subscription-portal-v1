import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold">Page Not Found</h1>
      <p className="mt-4">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
