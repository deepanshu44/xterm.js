/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import * as path from 'path';
import * as sinon from 'sinon';
import { assert } from 'chai';
import * as fontFinder from 'font-finder';
import * as fontLigatures from 'font-ligatures';

import * as ligatureSupport from '.';

describe('xterm-addon-ligatures', () => {
  let onRefresh: sinon.SinonStub;
  let term: MockTerminal;

  // -> forms a ligature in Fira Code and Iosevka, but www only forms a ligature
  // in Fira Code
  const input = 'a -> b www c';

  before(() => {
    sinon.stub(fontFinder, 'list').returns(Promise.resolve({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Fira Code': [{
        path: path.join(__dirname, '../fonts/firaCode.otf'),
        style: fontFinder.Style.Regular,
        type: fontFinder.Type.Monospace,
        weight: 400
      }],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Iosevka': [{
        path: path.join(__dirname, '../fonts/iosevka.ttf'),
        style: fontFinder.Style.Regular,
        type: fontFinder.Type.Monospace,
        weight: 400
      }],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Nonexistant Font': [{
        path: path.join(__dirname, '../fonts/nonexistant.ttf'),
        style: fontFinder.Style.Regular,
        type: fontFinder.Type.Monospace,
        weight: 400
      }]
    } as fontFinder.FontList));
  });

  beforeEach(() => {
    onRefresh = sinon.stub();
    term = new MockTerminal(onRefresh);
    ligatureSupport.enableLigatures(term as any);
  });

  it('registers itself correctly', () => {
    const term = new MockTerminal(sinon.spy());
    assert.isUndefined(term.joiner);
    ligatureSupport.enableLigatures(term as any);
    assert.isFunction(term.joiner);
  });

  it('registers itself correctly when called directly', () => {
    const term = new MockTerminal(sinon.spy());
    assert.isUndefined(term.joiner);
    ligatureSupport.enableLigatures(term as any);
    assert.isFunction(term.joiner);
  });

  it('returns an empty set of ranges on the first call while the font is loading', () => {
    assert.deepEqual(term.joiner!(input), []);
  });

  it('returns the correct set of ranges once the font has loaded', done => {
    assert.deepEqual(term.joiner!(input), []);
    onRefresh.callsFake(() => {
      assert.deepEqual(term.joiner!(input), [[2, 4], [7, 10]]);
      done();
    });
  });

  it('handles quoted font names', done => {
    term.options.fontFamily = '"Fira Code", monospace';
    assert.deepEqual(term.joiner!(input), []);
    onRefresh.callsFake(() => {
      assert.deepEqual(term.joiner!(input), [[2, 4], [7, 10]]);
      done();
    });
  });

  it('falls back to later fonts if earlier ones are not present', done => {
    term.options.fontFamily = 'notinstalled, Fira Code, monospace';
    assert.deepEqual(term.joiner!(input), []);
    onRefresh.callsFake(() => {
      assert.deepEqual(term.joiner!(input), [[2, 4], [7, 10]]);
      done();
    });
  });

  it('uses the current font value', done => {
    // The first three calls are all synchronous so that we don't allow time for
    // any fonts to load while we're switching things around
    term.options.fontFamily = 'Fira Code';
    assert.deepEqual(term.joiner!(input), []);
    term.options.fontFamily = 'notinstalled';
    assert.deepEqual(term.joiner!(input), []);
    term.options.fontFamily = 'Iosevka';
    assert.deepEqual(term.joiner!(input), []);
    onRefresh.callsFake(() => {
      assert.deepEqual(term.joiner!(input), [[2, 4]]);

      // And switch it back to Fira Code for good measure
      term.options.fontFamily = 'Fira Code';

      // At this point, we haven't loaded the new font, so the result reverts
      // back to empty until that happens
      assert.deepEqual(term.joiner!(input), []);

      onRefresh.callsFake(() => {
        assert.deepEqual(term.joiner!(input), [[2, 4], [7, 10]]);
        done();
      });
    });
  });

  it('allows multiple terminal instances that use different fonts', done => {
    const onRefresh2 = sinon.stub();
    const term2 = new MockTerminal(onRefresh2);
    term2.options.fontFamily = 'Iosevka';
    ligatureSupport.enableLigatures(term2 as any);

    assert.deepEqual(term.joiner!(input), []);
    onRefresh.callsFake(() => {
      assert.deepEqual(term.joiner!(input), [[2, 4], [7, 10]]);
      assert.deepEqual(term2.joiner!(input), []);
      onRefresh2.callsFake(() => {
        assert.deepEqual(term2.joiner!(input), [[2, 4]]);
        assert.deepEqual(term.joiner!(input), [[2, 4], [7, 10]]);
        done();
      });
    });
  });

  it('fails if it finds but cannot load the font', async () => {
    term.options.fontFamily = 'Nonexistant Font, monospace';
    assert.deepEqual(term.joiner!(input), []);
    await delay(500);
    assert.isTrue(onRefresh.notCalled);
  });

  it('returns nothing if the font is not present on the system', async () => {
    term.options.fontFamily = 'notinstalled';
    assert.deepEqual(term.joiner!(input), []);
    await delay(500);
    assert.isTrue(onRefresh.notCalled);
    assert.deepEqual(term.joiner!(input), []);
  });

  it('returns nothing if no specific font is specified', async () => {
    term.options.fontFamily = 'monospace';
    assert.deepEqual(term.joiner!(input), []);
    await delay(500);
    assert.isTrue(onRefresh.notCalled);
    assert.deepEqual(term.joiner!(input), []);
  });

  it('returns nothing if no fonts are provided', async () => {
    term.options.fontFamily = '';
    assert.deepEqual(term.joiner!(input), []);
    await delay(500);
    assert.isTrue(onRefresh.notCalled);
    assert.deepEqual(term.joiner!(input), []);
  });

  it('fails when given malformed inputs', async () => {
    term.options.fontFamily = {} as any;
    assert.deepEqual(term.joiner!(input), []);
    await delay(500);
    assert.isTrue(onRefresh.notCalled);
  });

  it('ensures no empty errors are thrown', async () => {
    sinon.stub(fontLigatures, 'loadFile').callsFake(async () => { throw undefined; });
    term.options.fontFamily = 'Iosevka';
    assert.deepEqual(term.joiner!(input), []);
    await delay(500);
    assert.isTrue(onRefresh.notCalled);
    (fontLigatures.loadFile as sinon.SinonStub).restore();
  });
});

class MockTerminal {
  private _options: { [name: string]: string | number } = {
    fontFamily: 'Fira Code, monospace',
    rows: 50
  };
  public joiner?: (text: string) => [number, number][];
  public refresh: (start: number, end: number) => void;

  constructor(onRefresh: (start: number, end: number) => void) {
    this.refresh = onRefresh;
  }

  public registerCharacterJoiner(handler: (text: string) => [number, number][]): number {
    this.joiner = handler;
    return 1;
  }
  public deregisterCharacterJoiner(id: number): void {
    this.joiner = undefined;
  }
  public get options(): { [name: string]: string | number } { return this._options; }
  public set options(options: { [name: string]: string | number }) {
    for (const key in this._options) {
      this._options[key] = options[key];
    }
  }
}

function delay(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}
