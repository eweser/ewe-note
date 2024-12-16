import { ChevronRight, FolderPlus, SquarePen } from 'lucide-react';

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
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Button } from '@/lib/button';
import removeMarkdown from 'markdown-to-text';

const exampleUser = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const {
    loggedIn,
    allRooms,
    loginUrl,
    selectedNoteId,
    selectedRoom,
    setSelectedNoteId,
    setSelectedRoom,
    db: { logoutAndClear },
  } = useDb();

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0" key={refreshKey}>
        <div className="flex align-middle justify-center">
          <Button variant="ghost">
            <SquarePen />
          </Button>
          <Button variant="ghost">
            <FolderPlus />
          </Button>
        </div>
        {/* We create a collapsible SidebarGroup for each parent. */}
        {allRooms.map((room) => {
          const docs = room.getDocuments();
          docs.onChange(() => setRefreshKey(refreshKey + 1));
          const notes = docs.toArray(docs.sortByRecent(docs.getUndeleted()));
          return (
            <Collapsible
              key={room.id}
              title={room.name}
              defaultOpen={selectedRoom?.id === room.id}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <CollapsibleTrigger>
                    <span title={room.name} className="line-clamp-1 text-left">
                      {room.name}
                    </span>

                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {notes.map((note) => (
                        <SidebarMenuItem key={note._id}>
                          <SidebarMenuButton
                            onClick={() => {
                              if (selectedNoteId === note._id) {
                                return;
                              }
                              if (selectedRoom?.id !== room.id) {
                                setSelectedRoom(room);
                              }
                              setSelectedNoteId(note._id);
                            }}
                            className="line-clamp-1"
                            isActive={selectedNoteId === note._id}
                          >
                            {removeMarkdown(note.text)}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        {loggedIn ? (
          <button
            onClick={() => {
              logoutAndClear();
              window.location.reload();
            }}
            className="flex items-center space-x-2"
          >
            <Icons.Logo className="h-6 w-6" />
            <span className="inline-block font-bold">Logout</span>
          </button>
        ) : (
          <a href={loginUrl} className="flex items-center space-x-2">
            <Icons.Logo className="h-6 w-6" />
            <span className="inline-block font-bold">Login</span>
          </a>
        )}

        <SidebarUser user={exampleUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
