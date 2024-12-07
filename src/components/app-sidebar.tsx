import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { SearchForm } from '@/components/search-form';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Icons } from '@/lib/icons';
import { SidebarUser } from './sidebar-user';
import { useDb } from '@/db';

const exampleData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { loggedIn, allRooms, db } = useDb();
  const data = {
    navMain: allRooms.map((room) => {
      const Notes = db.getDocuments(room);
      const notes = Notes.sortByRecent(Notes.getUndeleted());
      const notesArray = Array.from(Object.values(notes));
      return {
        title: room.name,
        url: '#',
        items: notesArray.map((note) => {
          return {
            title:
              note.text.length > 20
                ? note.text.substring(0, 20) + '...'
                : note.text,
            url: '#',
            isActive: false,
          };
        }),
      };
    }),
    user: exampleData.user,
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {loggedIn ? (
          <a href="#" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Logout</span>
          </a>
        ) : (
          <a href="#" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Login</span>
          </a>
        )}
        <a href="https://eweser.com" className="flex items-center space-x-2">
          <Icons.Logo className="h-6 w-6" />
          <span className="inline-block font-bold">Eweser DB</span>
        </a>
        <SidebarUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
