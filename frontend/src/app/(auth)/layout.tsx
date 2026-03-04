import "./auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="authPage">
      <div className="authContainer">

        {/* Left Side - Branding */}
        <div className="authLeft">
          <div className="brandWrapper">
            <h1 className="brandTitle">Timplan</h1>
            <p className="brandText">
              Your intelligent learning and spaced repetition system.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="authRight">
          <div className="authCardWrapper">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}