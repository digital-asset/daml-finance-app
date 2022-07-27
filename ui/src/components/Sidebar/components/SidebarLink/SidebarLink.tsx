// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import classnames from "classnames";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import useStyles from "./styles";
import { RouteEntry } from "../../RouteEntry";
import { Collapse, List } from "@mui/material";

type SidebarLinkProps = {
  label? : string
  level : number
  path : string
  icon? : JSX.Element
  children? : RouteEntry[]
}

export default function SidebarLink({ label, level, path, icon, children } : SidebarLinkProps) {
  const classes = useStyles();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isLinkActive = path && (pathname === path || pathname.indexOf(path) !== -1);

  const toggleCollapse = (e : React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    //e.preventDefault();
    setIsOpen(!isOpen);
  }

  return (
    <>
      <ListItem
        button={true}
        component={Link}
        onClick={!!children && children.length > 0 ? toggleCollapse: () => {}}
        to={path}
        className={classes.link}
        classes={{
          root: classnames(classes.linkRoot, {
            [classes.linkActive]: isLinkActive,
          }),
        }}
        disableRipple
      >
        {level < 2 && <ListItemIcon
          className={classnames(classes.linkIcon, {
            [classes.linkIconActive]: isLinkActive,
          })}
        >
          {icon}
        </ListItemIcon>}
        <ListItemText
          classes={{
            primary: classnames(classes.linkText, {
              [classes.linkTextActive]: isLinkActive,
              [classes.linkTextNested]: level > 1,
            }),
          }}
          primary={label}
        />
      </ListItem>
      {children && (
        <Collapse
          in={isOpen}
          timeout="auto"
          unmountOnExit
          className={classes.nestedList}
        >
          <List component="div" disablePadding>
            {children.map(child => (
              <SidebarLink
                key={child.label!}
                level={level + 1}
                {...child}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
