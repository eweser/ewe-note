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
import { Note, Room } from '@eweser/db';

const exampleData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
};
interface NavItem {
  title: string;
  url: string;
  isActive: boolean;
}

interface NavMain {
  title: string;
  url: string;
  items: NavItem[];
}

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface SidebarProps {
  navMain: NavMain[];
  user: User;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    loggedIn,
    allRooms,
    loginUrl,
    db: { logout },
  } = useDb();
  const initialData: SidebarProps = {
    navMain: allRooms.map((room) => {
      const Notes = room.getDocuments();
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

  const [data, setData] = React.useState(initialData);

  const updateNotes = (room: Room<Note>, notesArray: Note[]): NavMain[] => {
    return data.navMain.map((item) => {
      if (item.title === room.name) {
        return {
          ...item,
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
      }
      return item;
    });
  };

  allRooms.forEach((room) => {
    const Notes = room.getDocuments();
    Notes.onChange(() => {
      const notes = Notes.sortByRecent(Notes.getUndeleted());
      const notesArray = Array.from(Object.values(notes));
      setData({
        ...data,
        navMain: updateNotes(room, notesArray),
      });
    });
  });

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
          <button onClick={logout} className="flex items-center space-x-2">
            <Icons.Logo className="h-6 w-6" />
            <span className="inline-block font-bold">Logout</span>
          </button>
        ) : (
          <a href={loginUrl} className="flex items-center space-x-2">
            <Icons.Logo className="h-6 w-6" />
            <span className="inline-block font-bold">Login</span>
          </a>
        )}

        <SidebarUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
