const Header = () => {
    return (
        <header className="bg-primary text-white px-6 flex items-center justify-between shadow-md fixed top-0 left-0 w-full z-50">
            {/* Left: Emoji Logo */}
            <h1 className="flex items-center space-x-2">
                <img src="../images/unbound-logo.png" alt="Logo" className="w-14 h-14" />
            </h1>


            {/* Center: Title */}
            <h1 className="text-2xl font-bold tracking-wide">Unbound</h1>

            {/* Right: Icons */}
            <div className="flex space-x-6 text-2xl">
                <img src="/images/settings.png" alt="settings" className="w-14 h-14" />
                <img src="/images/help.png" alt="help" className="w-14 h-14" />
            </div>
        </header>
    );
};

export default Header;
