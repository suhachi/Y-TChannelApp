"use client";

// Sidebar component stub - not used in this project
// Simplified to remove class-variance-authority dependency

import * as React from "react";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}

export function useSidebar() {
  return {
    state: "expanded" as const,
    open: true,
    setOpen: () => {},
    openMobile: false,
    setOpenMobile: () => {},
    isMobile: false,
    toggleSidebar: () => {},
  };
}
