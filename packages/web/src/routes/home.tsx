import { useQuery } from '@tanstack/react-query';
import { Cog } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { NavLink } from 'react-router';
import { UUID } from '@elizaos/core';
import { formatAgentName } from '@/lib/utils';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const query = useQuery({
    queryKey: ['agents'],
    queryFn: () => apiClient.getAgents(),
    refetchInterval: 5_000,
  });

  const agents = query?.data?.agents;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* <PageTitle title="Agents" /> */}
      <div>
        <Dashboard />
      </div>
      {/* <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {agents?.map((agent: { id: UUID; name: string }) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle>{agent?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid aspect-square w-full place-items-center rounded-md bg-muted">
                <div className="text-6xl font-bold uppercase">{formatAgentName(agent?.name)}</div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center gap-4">
                <NavLink to={`/chat/${agent.id}`} className="w-full grow">
                  <Button variant="outline" className="w-full grow">
                    Chat
                  </Button>
                </NavLink>
                <NavLink to={`/settings/${agent.id}`} key={agent.id}>
                  <Button size="icon" variant="outline">
                    <Cog />
                  </Button>
                </NavLink>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div> */}
    </div>
  );
}
