import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Menu,
    X,
    BookOpen,
    Users,
    Phone,
    Home,
    LogIn,
    GraduationCap,
    Bell
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const navItems = [
        { label: t('Accueil') || 'Accueil', icon: Home, path: '/' },
        { label: t('Concours') || 'Concours', icon: BookOpen, path: '/concours' },
        { label: t('A propos') || 'À propos', icon: GraduationCap, path: '/about' },
        { label: t('contact') || 'Contact', icon: Phone, path: '/support' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              GABConcours
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                variant="ghost"
                                className="text-sm font-medium"
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon className="h-4 w-4 mr-2" />
                                {item.label}
                            </Button>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center space-x-3">
                        <LanguageSwitcher />
                        <ThemeSwitcher />

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/connexion')}
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Suivre ma candidature
                        </Button>

                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-primary to-blue-600 text-white"
                            onClick={() => navigate('/concours')}
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Postuler
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <Button
                                    key={item.path}
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <item.icon className="h-4 w-4 mr-2" />
                                    {item.label}
                                </Button>
                            ))}

                            <div className="flex items-center space-x-2 px-4 py-2">
                                <LanguageSwitcher />
                                <ThemeSwitcher />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    navigate('/connexion');
                                    setIsMenuOpen(false);
                                }}
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Connexion
                            </Button>

                            <Button
                                className="w-full justify-start bg-gradient-to-r from-primary to-blue-600 text-white"
                                onClick={() => {
                                    navigate('/concours');
                                    setIsMenuOpen(false);
                                }}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Postuler
                            </Button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
