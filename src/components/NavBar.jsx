import { Link, useLocation } from 'react-router-dom';

function NavBar() {
    const location = useLocation(); // Get current route to apply active styles

    return (
        <nav className="text-text bg-mantle p-4 text-xl space-x-4 font-semibold">
            {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/fantasy", label: "Fantasy" },
                { to: "/settings", label: "Settings" },
            ].map((link) => {
                const isActive = location.pathname === link.to;

                return (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`relative group transition-all duration-200
                                    ${isActive ? 'text-accent' : 'hover:text-accent'} 
                                    ${isActive ? 'scale-100' : 'hover:scale-95 active:scale-110'}`}
                    >
                        {link.label}
                        {/* Custom underline effect */}
                        <span
                            className={`absolute left-1/2 bottom-0 h-[2px] bg-accent transition-all duration-300 transform -translate-x-1/2 
                                        ${isActive ? 'w-full' : 'w-0 group-hover:w-4/5 group-active:w-full'}`}
                        />
                    </Link>
                );
            })}
        </nav>
    );
}

export default NavBar;
