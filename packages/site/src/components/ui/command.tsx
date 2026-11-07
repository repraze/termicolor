import {Command as CommandPrimitive} from "cmdk";
import {cn} from "cn";
import {SearchIcon} from "lucide-react";
import * as React from "react";

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";

function Command({className, ...props}: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn("bg-popover text-popover-foreground flex size-full flex-col overflow-hidden", className)}
            {...props}
        />
    );
}

function CommandDialog({
    title = "Command palette",
    description = "Search for a command to run…",
    children,
    className,
    initialFocus,
    ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
    title?: string;
    description?: string;
    className?: string;
    /** what gets focus on open, usually the input (the popup itself otherwise) */
    initialFocus?: React.ComponentProps<typeof DialogContent>["initialFocus"];
    children: React.ReactNode;
}) {
    return (
        <Dialog {...props}>
            <DialogHeader className="sr-only">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogContent
                className={cn("top-[15vh] translate-y-0 overflow-hidden p-0 sm:max-w-xl", className)}
                showCloseButton={false}
                initialFocus={initialFocus}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
}

function CommandInput({className, ...props}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div data-slot="command-input-wrapper" className="flex items-center gap-2 border-b px-3">
            <SearchIcon className="text-muted-foreground size-4 shrink-0" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn(
                    "placeholder:text-muted-foreground h-11 w-full bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        </div>
    );
}

function CommandList({className, ...props}: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={cn(
                "max-h-[min(60vh,28rem)] scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain",
                className,
            )}
            {...props}
        />
    );
}

function CommandEmpty({className, ...props}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className={cn("text-muted-foreground py-8 text-center text-xs", className)}
            {...props}
        />
    );
}

function CommandGroup({className, ...props}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="command-group"
            className={cn(
                "text-foreground p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:tracking-widest **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:uppercase",
                className,
            )}
            {...props}
        />
    );
}

function CommandSeparator({className, ...props}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={cn("bg-border h-px", className)}
            {...props}
        />
    );
}

/** The highlighted item is a selected row (DESIGN.md §6): accent tint plus an accent side bar, `fg` text. */
function CommandItem({className, ...props}: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                "group/command-item relative flex cursor-default items-center gap-3 border-l-2 border-transparent px-2 py-2 text-xs outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:border-primary-text data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />
    );
}

function CommandShortcut({className, ...props}: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="command-shortcut"
            className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
            {...props}
        />
    );
}

export {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
};
