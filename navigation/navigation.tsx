import { Close, ExpandLess, ExpandMore, Menu } from "@mui/icons-material";
import { Collapse, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
// import { AuthContext, useAuth } from "../hooks/useAuth";


export const Navigation = (
    menuItems: {
        text: string;
        icon: React.JSX.Element;
        path: string;
        roles: string[];
        subitem?: undefined;
        key?: undefined;
        handler?: undefined;
    },
    user: {
        role: number;
        org: number;
    }
) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openSubItems, setOpenSubItems] = useState({});

    const toggleSubItem = (item) => {
        setOpenSubItems(prev => ({
            ...prev,
            [item]: !prev[item]
        }))
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const filterMenuItems = (items) => {
        return items
            .filter(item => !item.roles || item.roles.includes(user?.role.toString())) // Проверяем главный пункт
            .map(item => {
                if (item.subitem) {
                    return {
                        ...item,
                        subitem: item.subitem.filter(sub => !sub.roles || sub.roles.includes(user?.role.toString()))
                    };
                }
                return item;
            })
            // Удаляем родительский пункт, если в нем были подпункты, но все они отфильтровались
            .filter(item => !item.subitem || item.subitem.length > 0);            
    };

    const allowedMenuItems = filterMenuItems(menuItems);
    
    
    return (
        <div className="relative z-50">
            <IconButton
                onClick={toggleSidebar}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
                <Menu/>
            </IconButton>
            <Drawer 
                anchor="left"
                open={isSidebarOpen}
                onClose={toggleSidebar}
                variant="temporary"
            >
                <div className="w-full bg-white shadow-lg h-14">
                    <div className="flex justify-end p-1">
                        <IconButton onClick={toggleSidebar}>
                            <Close className="text-gray-600"/>
                        </IconButton>
                    </div>
                </div>
                <List component="nav" className="flex-col">
                    {allowedMenuItems.map((item) => (
                        <Fragment key={item.text}>
                            {item.subitem ? (
                                <>
                                    <ListItem
                                        className="hover:bg-gray-100 transition-colors active:bg-gray-200 group"
                                        disablePadding
                                    >
                                        <ListItemButton
                                            onClick={() => toggleSubItem(item.key)}
                                            className="hover:bg-gray-700"
                                        >
                                            <ListItemIcon>
                                                {item.icon}                                
                                            </ListItemIcon>
                                            {isSidebarOpen && (
                                                <>
                                                    <ListItemText
                                                        primary={item.text}
                                                        className="text-gray-800 font-medium"
                                                    />
                                                    {openSubItems[item.key] ? <ExpandLess/> : <ExpandMore/>}
                                                </>
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in = {openSubItems[item.key] && isSidebarOpen} timeout="auto" unmountOnExit>
                                        <List
                                            component="div" 
                                            disablePadding
                                            onClick={toggleSidebar}
                                        >
                                            {item.subitem.map((subItem) =>(
                                                <Link
                                                    to={subItem.path}
                                                    key={subItem.text}
                                                    className="no-underline text-inherit"
                                                >
                                                    <ListItemButton
                                                        key={subItem.text}
                                                        className="hover:bg-gray-700"
                                                        onClick={item.handler}
                                                    >
                                                        {isSidebarOpen && <ListItemText primary={subItem.text}/>}
                                                    </ListItemButton>
                                                </Link>
                                            ))}
                                        </List>
                                    </Collapse>
                                </>
                                ) : (
                                    <Link
                                        to={item.path}
                                        key={item.text}
                                        onClick={toggleSidebar}
                                    >
                                        <ListItem
                                            className="hover:bg-gray-100 transition-colors active:bg-gray-200 group"
                                            disablePadding
                                        >
                                            <ListItemButton
                                                className="hover:bg-gray-700"
                                                onClick={item.handler}
                                            >
                                                <ListItemIcon>
                                                    {item.icon}                                
                                                </ListItemIcon>
                                                {isSidebarOpen && <ListItemText primary={item.text}/>}
                                            </ListItemButton>
                                        </ListItem>
                                    </Link>
                                )
                            }
                        </Fragment>
                    ))}
                </List>
            </Drawer>  
        </div>
    );
};

