import {
  BoxProps,
  ModalProps,
  PopoverProps,
  SwipeableDrawerProps,
} from "@mui/material";
import { ModalAppBarProps } from "./ModalAppBar";

export type SlotProps = {
  sheet?: Partial<SwipeableDrawerProps> & { gap?: number };
  appBar?: Partial<ModalAppBarProps>;
  popover?: Partial<PopoverProps>;
  paper?: Partial<BoxProps>;
  modal?: Partial<ModalProps>;
  scroll?: Omit<Partial<unknown>, "ref">;
};
