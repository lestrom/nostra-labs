import { useQuery } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { apiClient } from '@/lib/api';
import { NavLink, useLocation } from 'react-router-dom'; // ✅ Correct import
import { type UUID } from '@elizaos/core';
import { User } from 'lucide-react';
import ConnectionStatus from './connection-status';

export function AppSidebar() {
  const location = useLocation();
  const { data, isPending } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => apiClient.getAgents(), // ✅ Added async
    refetchInterval: 5_000,
  });

  const agents = data?.agents || []; // ✅ Avoid undefined error

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <img
                  src="/Nostra-labs_logo.svg"
                  width="100%"
                  height="100%"
                  className="w-7 h-7" // ✅ Fixed className
                  alt="Nostra Labs Logo"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Nostra-Labs</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPending ? (
                <div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))}
                </div>
              ) : (
                <div>
                  {agents.map((agent: { id: UUID; name: string }) => (
                    <SidebarMenuItem key={String(agent.id)}> {/* ✅ Ensure key is a string */}
                      <NavLink to={`/chat/${agent.id}`}>
                        <SidebarMenuButton isActive={location.pathname.includes(String(agent.id))}> {/* ✅ Ensure isActive check */}
                          <User />
                          <span>{agent.name}</span>
                        </SidebarMenuButton>
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <ConnectionStatus />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
