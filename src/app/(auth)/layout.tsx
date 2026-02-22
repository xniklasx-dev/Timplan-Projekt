export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (        
        <div className="a">
            {/* Linke Seite (Branding / Info) */}
            <div className="b">
                <h1 className="b1">Timplan</h1>
                <p className="b2">Your intelligent learning and Anki-system for your studies</p>
            </div>

            {/* Rechte Seite (Formularbereich) */}
            <div className="c">
                <div className="d">
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}