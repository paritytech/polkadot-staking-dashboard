// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  INTERFACE_MAXIMUM_WIDTH,
  SHOW_ACCOUNTS_BUTTON_WIDTH_THRESHOLD,
  SIDE_MENU_MAXIMISED_WIDTH,
  SIDE_MENU_MINIMISED_WIDTH,
  SIDE_MENU_STICKY_THRESHOLD,
} from 'consts';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  backgroundGradient,
  backgroundPrimary,
  borderPrimary,
  buttonSecondaryBackground,
  textPrimary,
  textSecondary,
} from 'theme';
import {
  InterfaceLayoutProps,
  PageRowWrapperProps,
  PageTitleWrapperProps,
  SideInterfaceWrapperProps,
} from 'types/styles';

/* EntryWrapper
 *
 * Highest level app component.
 * Provides global styling for headers and other global
 * classes used throughout the app and possibly the library.
 */
export const EntryWrapper = styled.div`
  background: ${backgroundGradient};
  box-sizing: border-box;
  width: 100%;
  background-attachment: fixed;
  display: flex;
  flex-flow: column nowrap;
  min-height: 100vh;
  flex-grow: 1;

  h1 {
    color: ${textPrimary};
  }
  h2 {
    color: ${textPrimary};
  }
  h3 {
    color: ${textPrimary};
  }
  h4 {
    color: ${textPrimary};
  }
  h5 {
    color: ${textPrimary};
  }
  p {
    color: ${textSecondary};
  }
  a {
    color: ${textSecondary};
  }
  input {
    color: ${textPrimary};
  }

  path.primary {
    fill: ${textPrimary};
  }

  ellipse.primary {
    fill: ${textPrimary};
  }

  input {
    border: none;
    border-bottom: 1px solid #ddd;
    padding: 0.7rem 0rem;
    font-size: 1.1rem;
    background: none;
    transition: all 0.1s;
  }

  input::placeholder {
    color: #aaa;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }

  .page-padding {
    padding-left: 1.25rem;
    padding-right: 1.25rem;

    @media (min-width: ${SHOW_ACCOUNTS_BUTTON_WIDTH_THRESHOLD + 1}px) {
      padding-left: 1.75rem;
      padding-right: 1.75rem;
    }
    @media (min-width: ${SIDE_MENU_STICKY_THRESHOLD + 1}px) {
      padding: 0 3rem 0 1rem;
    }
    @media (min-width: 1500px) {
      padding: 0 5rem 0 1rem;
    }
  }
`;

/* BodyInterfaceWrapper
 *
 * An element that houses SideInterface and MainInterface.
 * Used once in Router.
 */
export const BodyInterfaceWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  flex-grow: 1;
`;

/* SideInterfaceWrapper
 *
 * An element that houses the side menu and handles resizing
 * on smaller screens.
 * Used once in Router.
 */
export const SideInterfaceWrapper = styled.div<SideInterfaceWrapperProps>`
  box-sizing: border-box;
  height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  position: sticky;
  top: 0px;
  z-index: 7;
  flex: 0;
  overflow: hidden;
  min-width: ${(props) =>
    props.minimised
      ? `${SIDE_MENU_MINIMISED_WIDTH}px`
      : `${SIDE_MENU_MAXIMISED_WIDTH}px`};
  max-width: ${(props) =>
    props.minimised
      ? `${SIDE_MENU_MINIMISED_WIDTH}px`
      : `${SIDE_MENU_MAXIMISED_WIDTH}px`};
  transition: all 0.5s cubic-bezier(0.1, 1, 0.2, 1);

  @media (max-width: ${SIDE_MENU_STICKY_THRESHOLD}px) {
    position: fixed;
    top: 0;
    left: ${(props) => (props.open ? 0 : `-${SIDE_MENU_MAXIMISED_WIDTH}px`)};
  }
`;

/* MainInterfaceWrapper
 *
 * A column flex wrapper that hosts the main page content.
 * Used once in Router.
 */
export const MainInterfaceWrapper = styled.div`
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
`;

/* PageWrapper
 *
 * A motion.div that wraps every page.
 * Transitions can be applied to this wrapper that will
 * affect the entire page.
 */
export const PageWrapper = styled(motion.div)`
  max-width: ${INTERFACE_MAXIMUM_WIDTH}px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 4.5rem;
  width: 100%;
  margin: 0 auto;
`;

/* PageTitleWrapper
 *
 * The element that wraps a page title. Determines the padding
 * and position relative to top of screen when the element
 * is stuck.
 */
export const PageTitleWrapper = styled.header<PageTitleWrapperProps>`
  box-sizing: border-box;
  background: ${backgroundPrimary};
  position: sticky;
  top: 0px;
  padding-top: ${(props) => (props.sticky ? '1.5rem' : '0.5rem')};
  margin-top: 4rem;
  margin-bottom: 0.25rem;
  padding-bottom: ${(props) => (props.sticky ? '0.25rem' : 0)};
  width: 100%;
  z-index: 5;
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-end;
  transition: padding 0.3s ease-out;

  @media (max-width: ${SIDE_MENU_STICKY_THRESHOLD}px) {
    top: 4rem;
    padding-top: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .title {
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    width: 100%;
    margin-bottom: ${(props) => (props.sticky ? '0.75rem ' : 0)};

    > div {
      &:last-child {
        padding-left: 1rem;
        flex-grow: 1;
      }
    }

    button {
      color: ${textSecondary};
      border: 1px solid ${borderPrimary};
      padding: 0.5rem 0.75rem;
      margin: 0;
      border-radius: 0.75rem;

      &:hover {
        background: ${buttonSecondaryBackground};
      }

      .icon {
        margin-left: 0.75rem;
      }
    }
  }

  h1 {
    font-family: 'Unbounded', 'sans-serif', sans-serif;
    font-size: ${(props) => (props.sticky ? '1.4rem ' : '1.75rem')};
    @media (max-width: ${SIDE_MENU_STICKY_THRESHOLD}px) {
      font-size: 1.5rem;
    }
    transition: font 0.5s;
    margin: 0;
  }

  .tabs {
    box-sizing: border-box;
    overflow: hidden;
    max-width: ${INTERFACE_MAXIMUM_WIDTH}px;
    transition: margin 0.2s;
    height: 3.5rem;

    margin-top: ${(props) => (props.sticky ? '0.5rem' : '0.9rem')};
    @media (max-width: ${SIDE_MENU_STICKY_THRESHOLD}px) {
      margin-top: 0.5rem;
    }

    > .scroll {
      box-sizing: border-box;
      width: 100%;
      height: 4.5rem;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .inner {
      display: flex;
      flex-flow: row nowrap;
      border-bottom: ${(props) => (props.sticky ? '0px' : '1px solid')};
      border-bottom-color: ${borderPrimary};

      > button {
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        margin-right: 0.75rem;
        font-size: ${(props) => (props.sticky ? '1.05rem' : '1.15rem')};
        color: ${textSecondary};
        transition: opacity 0.1s, font-size 0.1s;
        border-radius: 0.5rem;

        &.active {
          background: ${buttonSecondaryBackground};
        }
        &:last-child {
          margin-right: 0;
        }
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
`;

/* MenuPaddingWrapper
 *
 * A fixed block that is used to hide scrollable content
 * on smaller screens when a PageTitle is fixed.
 * Purely cosmetic. Applied in Pagetitle.
 */
export const MenuPaddingWrapper = styled.div`
  background: ${backgroundPrimary};
  box-sizing: border-box;
  position: fixed;
  top: 0px;
  width: 100%;
  height: 4rem;
  z-index: 4;
  display: none;
  @media (max-width: ${SIDE_MENU_STICKY_THRESHOLD}px) {
    display: block;
  }
`;

/* PageRowWrapper
 *
 * Used to separate page content based on rows.
 * Commonly used with RowPrimaryWrapper and RowSecondaryWrapper.
 */
export const PageRowWrapper = styled.div<PageRowWrapperProps>`
  box-sizing: border-box;
  margin-top: ${(props) => (props.noVerticalSpacer === true ? '0' : '1rem')};
  margin-bottom: ${(props) => (props.noVerticalSpacer === true ? '0' : '1rem')};
  display: flex;
  flex-shrink: 0;
  flex-flow: row wrap;
  width: 100%;
  * {
    box-sizing: border-box;
  }
  /* kill heading padding, already applied to wrapper */
  h1,
  h2,
  h3,
  h4 {
    margin-top: 0;
  }
`;

/* RowPrimaryWrapper
 *
 * The primary module in a PageRow.
 */
export const RowPrimaryWrapper = styled.div<InterfaceLayoutProps>`
  order: ${(props) => props.vOrder};
  box-sizing: border-box;
  flex: 1;
  flex-basis: 100%;
  max-width: 100%;

  @media (min-width: ${(props) => props.thresholdStickyMenu + 1}px) {
    ${(props) => props.hOrder === 0 && ' padding-right: 0.75rem;'}
    ${(props) => props.hOrder === 1 && 'padding-left: 0.75rem;'}
    order: ${(props) => props.hOrder};
    flex: 1;
    flex-basis: 56%;
    width: 56%;
    max-width: ${(props) => (props.maxWidth ? props.maxWidth : 'none')};
  }

  @media (min-width: ${(props) => props.thresholdFullWidth + 400}px) {
    flex-basis: 62%;
    width: 62%;
    max-width: ${(props) => (props.maxWidth ? props.maxWidth : 'none')};
  }
`;

/* RowSecondaryWrapper
 *
 * The secondary module in a PageRow.
 */
export const RowSecondaryWrapper = styled.div<InterfaceLayoutProps>`
  order: ${(props) => props.vOrder};
  box-sizing: border-box;
  flex-basis: 100%;
  width: 100%;
  border-radius: 1rem;

  @media (min-width: ${(props) => props.thresholdStickyMenu + 1}px) {
    ${(props) => props.hOrder === 1 && ' padding-left: 0.75rem;'}
    ${(props) => props.hOrder === 0 && 'padding-right: 0.75rem;'}
    order: ${(props) => props.hOrder};
    flex: 1;
    flex-basis: 44%;
    width: 44%;
    max-width: ${(props) => (props.maxWidth ? props.maxWidth : 'none')};
  }

  @media (min-width: ${(props) => props.thresholdFullWidth + 400}px) {
    flex-basis: 38%;
    max-width: ${(props) => (props.maxWidth ? props.maxWidth : '38%')};
  }
`;

/* Separator
 *
 * A horizontal spacer with a bottom border.
 * General spacer for separating content by row.
 */
export const Separator = styled.div`
  border-bottom: 1px solid ${borderPrimary};
  width: 100%;
  margin: 0.75rem 0;
`;

/* TopBarWrapper
 *
 * Positioned under titles for a Go Back button and other page header info.
 */
export const TopBarWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  border-bottom: 1px solid ${borderPrimary};
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  width: 100%;
  margin-bottom: 0.25rem;

  button {
    padding: 0.75rem 1rem;
    margin-right: 1rem;
  }

  h3 {
    color: ${textSecondary};
    font-size: 1.15rem;
    margin: 0.25rem 0;
    min-height: 2rem;
  }

  .right {
    flex: 1 1 0%;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;

    button {
      margin: 0 0 0 1rem;
    }
  }
`;
