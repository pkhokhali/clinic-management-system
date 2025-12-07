'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as AccountCircleIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Lab Technician'] },
  { text: 'My Profile', icon: <AccountCircleIcon />, path: '/dashboard/profile', roles: ['Patient'] },
  { text: 'Users Management', icon: <PeopleIcon />, path: '/dashboard/users', roles: ['Super Admin', 'Admin'] },
  { text: 'Patients', icon: <PeopleIcon />, path: '/dashboard/patients', roles: ['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient'] },
  { text: 'Doctor Schedules', icon: <CalendarIcon />, path: '/dashboard/schedules', roles: ['Super Admin', 'Admin'] },
  { text: 'Appointments', icon: <CalendarIcon />, path: '/dashboard/appointments', roles: ['Super Admin', 'Admin', 'Receptionist', 'Patient'] },
  { text: 'My Appointments', icon: <CalendarIcon />, path: '/dashboard/my-appointments', roles: ['Doctor'] },
  { text: 'Follow-up Appointments', icon: <EventAvailableIcon />, path: '/dashboard/follow-ups', roles: ['Super Admin', 'Admin', 'Receptionist'] },
  { text: 'Medical Records', icon: <AssignmentIcon />, path: '/dashboard/medical-records', roles: ['Super Admin', 'Admin', 'Doctor', 'Receptionist'] },
  { text: 'Laboratory', icon: <ScienceIcon />, path: '/dashboard/laboratory', roles: ['Super Admin', 'Admin', 'Doctor', 'Lab Technician', 'Receptionist'] },
  { text: 'Billing', icon: <ReceiptIcon />, path: '/dashboard/billing', roles: ['Super Admin', 'Admin', 'Receptionist'] },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/dashboard/inventory', roles: ['Super Admin', 'Admin'] },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/dashboard/reports', roles: ['Super Admin', 'Admin'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings', roles: ['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Lab Technician', 'Patient'] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
    handleMenuClose();
  };

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: [1],
          gap: 1,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/logo.png"
            alt="KTM Life Care Clinic Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          KTM Life Care Clinic
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => router.push(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            <MenuItem onClick={() => router.push('/dashboard/profile')}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToAppIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
