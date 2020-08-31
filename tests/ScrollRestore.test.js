import React from "react";
import { shallow } from "enzyme";

import {
  ScrollReplace,
  setPageScrollPosition,
  dequeuePaths,
  getScrollPosition,
  scrollTo,
  isBrowser,
} from "../../library";
import PathMap from "../../PathMap";

jest.mock("../../PathMap");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "/test",
  }),
  useHistory: () => ({
    action: "POP",
  }),
}));
jest.useFakeTimers();

const OFFSET_AMOUNT = 200;

describe("utils > scroll", () => {
  const scrollToSpy = jest.fn(() => {});
  let windowSpy;

  beforeEach(() => {
    windowSpy = jest.spyOn(global, "window", "get").mockImplementation(() => ({
      pageYOffset: OFFSET_AMOUNT,
      scrollTo: scrollToSpy,
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
    PathMap.clear();
  });

  describe("ScrollReplace", () => {
    let wrapper;

    it("doesn't render any JSX", () => {
      wrapper = shallow(<ScrollReplace />);

      expect(wrapper.isEmptyRender()).toBe(true);
    });
  });

  describe("setPageScrollPosition", () => {
    it("sets an offset for a given path", () => {
      const expected = new Map([["/test", OFFSET_AMOUNT]]);

      setPageScrollPosition("/test");

      expect(PathMap).toEqual(expected);
    });
  });

  describe("dequeuePaths", () => {
    it("doesn't affect the map if it's not past the maximum size", () => {
      PathMap.set("path 1", "1");
      PathMap.set("path 2", "2");
      PathMap.set("path 3", "3");
      PathMap.set("path 4", "4");
      PathMap.set("path 5", "5");

      const expected = new Map([
        ["path 1", "1"],
        ["path 2", "2"],
        ["path 3", "3"],
        ["path 4", "4"],
        ["path 5", "5"],
      ]);

      dequeuePaths();

      expect(PathMap.size).toBe(5);
      expect(PathMap).toEqual(expected);
    });

    it("removes the oldest value when map size exceeds maximum threshold", () => {
      PathMap.set("path 1", "1");
      PathMap.set("path 2", "2");
      PathMap.set("path 3", "3");
      PathMap.set("path 4", "4");
      PathMap.set("path 5", "5");
      PathMap.set("path 6", "6");

      const expected = new Map([
        ["path 2", "2"],
        ["path 3", "3"],
        ["path 4", "4"],
        ["path 5", "5"],
        ["path 6", "6"],
      ]);

      dequeuePaths();

      expect(PathMap.size).toBe(5);
      expect(PathMap).toEqual(expected);
    });
  });

  describe("getScrollPosition", () => {
    it("returns the current page offset", () => {
      const expected = OFFSET_AMOUNT;
      const actual = getScrollPosition();

      expect(actual).toBe(expected);
    });
  });

  describe("scrollTo", () => {
    it("calls window.scrollTo with the provided offset", () => {
      scrollTo(OFFSET_AMOUNT);

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(windowSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("isBrowser", () => {
    it("returns false if window is not defined", () => {
      windowSpy.mockImplementation(() => undefined);

      const expected = false;
      const actual = isBrowser();

      expect(actual).toBe(expected);
    });

    it("returns true if window is defined", () => {
      const expected = true;
      const actual = isBrowser();

      expect(actual).toBe(expected);
    });
  });
});
