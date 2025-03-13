import React from "react";

const Demo: React.FC = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="bg-gray-900 text-white w-64 p-4">
                <div className="text-xl font-bold mb-6">Petcare</div>
                <div className="mb-4">
                    <div className="text-gray-400 mb-2">MENU</div>
                    <div className="flex items-center mb-2">
                        <i className="fas fa-th-large mr-2"></i>
                        <span>Bảng điều khiển</span>
                    </div>
                    <div className="ml-6 text-gray-400">eCommerce</div>
                </div>
                <div className="flex items-center mb-2">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    <span>Calendar</span>
                </div>
                <div className="flex items-center mb-2">
                    <i className="fas fa-user mr-2"></i>
                    <span>Profile</span>
                </div>
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <i className="fas fa-file-alt mr-2"></i>
                        <span>Forms</span>
                    </div>
                    <div className="ml-6 text-gray-400">Form Elements</div>
                    <div className="ml-6 text-gray-400">Form Layout</div>
                </div>
                <div className="flex items-center mb-2 bg-gray-700 p-2 rounded">
                    <i className="fas fa-table mr-2"></i>
                    <span>Tables</span>
                </div>
                <div className="flex items-center mb-2">
                    <i className="fas fa-cog mr-2"></i>
                    <span>Settings</span>
                </div>
                <div className="mt-6">
                    <div className="text-gray-400 mb-2">OTHERS</div>
                    <div className="flex items-center mb-2">
                        <i className="fas fa-chart-bar mr-2"></i>
                        <span>Chart</span>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <input type="text" placeholder="Type to search..." className="p-2 border rounded w-1/3" />
                    <div className="flex items-center">
                        <i className="fas fa-cog text-gray-400 mr-4"></i>
                        <i className="fas fa-bell text-gray-400 mr-4"></i>
                        <i className="fas fa-comment text-gray-400 mr-4"></i>
                        <div className="flex items-center">
                            <img src="https://placehold.co/40x40" alt="User profile" className="rounded-full mr-2" />
                            <div>
                                <div className="font-bold">Thomas Anree</div>
                                <div className="text-gray-400 text-sm">UX Designer</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Product Info */}
                <div className="bg-white p-4 rounded shadow mb-6">
                    <div className="flex items-center">
                        <img src="https://placehold.co/60x60" alt="HP Probook 450" className="rounded mr-4" />
                        <div className="flex-1">
                            <div className="font-bold">HP Probook 450</div>
                            <div className="text-gray-400">Electronics</div>
                        </div>
                        <div className="text-gray-400">$499</div>
                        <div className="text-gray-400 mx-4">72</div>
                        <div className="text-green-500">$103</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Demo;
