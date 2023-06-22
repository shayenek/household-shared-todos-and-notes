import React, { type ReactNode, createContext, useState, type MouseEventHandler } from 'react';

type AppContextType = {
	sidebarVisible: boolean;
	toggleSidebar: MouseEventHandler<HTMLButtonElement> | undefined;
};

const defaultAppContextValue: AppContextType = {
	sidebarVisible: false,
	toggleSidebar: undefined,
};

const AppContext = createContext<AppContextType>(defaultAppContextValue);

// Create a provider component
const AppProvider = ({ children }: { children: ReactNode }) => {
	const [sidebarVisible, setSidebarVisible] = useState(false);

	const toggleSidebar = () => {
		setSidebarVisible(!sidebarVisible);
	};

	// Provide the state and functions to the child components
	const contextValue = {
		sidebarVisible: sidebarVisible,
		toggleSidebar: toggleSidebar,
	};

	return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
