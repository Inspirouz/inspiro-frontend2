import '@/styles/index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { reportWebVitals } from '@/utils/performance';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Safari + React 19 fix:
// React 19's concurrent rendering calls style.setProperty("display","none","important")
// to hide elements (hideInstance). The unhide step sets style.display = "" which in
// Safari does NOT remove !important inline declarations (WebKit bug). Elements stay
// permanently hidden. Fix: block the setProperty call entirely so hide never happens.
(function () {
  // Block React's hideInstance: setProperty("display","none","important")
  const origSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (
    name: string,
    value: string,
    priority?: string,
  ) {
    if (name === 'display' && value === 'none' && priority === 'important') {
      return;
    }
    origSetProperty.call(this, name, value, priority ?? '');
  };

  // Also block setAttribute('hidden') and el.hidden = true
  const origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if (name === 'hidden') return;
    origSetAttr.call(this, name, value);
  };

  const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidden');
  if (desc?.set) {
    Object.defineProperty(HTMLElement.prototype, 'hidden', {
      get: desc.get,
      set(val: boolean) {
        if (!val) desc.set!.call(this, false);
      },
      configurable: true,
    });
  }

  // Belt-and-suspenders: strip any hidden attrs or display:none!important that slip through.
  // The style-attribute branch handles Safari macOS where the setProperty prototype patch above
  // may be bypassed by WebKit's internal binding — we use getAttribute/setAttribute string
  // manipulation to remove display:none!important without going through the CSS engine.
  const fixDisplayNone = (el: HTMLElement) => {
    const styleAttr = el.getAttribute('style');
    if (styleAttr && /display\s*:\s*none\s*!\s*important/i.test(styleAttr)) {
      const fixed = styleAttr.replace(/display\s*:\s*none\s*!\s*important\s*;?\s*/gi, '').trim();
      if (fixed) {
        el.setAttribute('style', fixed);
      } else {
        el.removeAttribute('style');
      }
    }
  };

  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'attributes') {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'hidden') {
          el.removeAttribute('hidden');
        } else if (m.attributeName === 'style') {
          fixDisplayNone(el);
        }
      } else if (m.type === 'childList') {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE) {
            const el = n as HTMLElement;
            if (el.hasAttribute('hidden')) el.removeAttribute('hidden');
            el.querySelectorAll('[hidden]').forEach((c) => c.removeAttribute('hidden'));
            fixDisplayNone(el);
            el.querySelectorAll<HTMLElement>('[style]').forEach(fixDisplayNone);
          }
        });
      }
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['hidden', 'style'],
    childList: true,
    subtree: true,
  });

  // RAF loop: Safari may not fire MutationObserver for style.setProperty changes,
  // and WebKit's internal binding can bypass our CSSStyleDeclaration prototype patch.
  // We check via BOTH getPropertyPriority (JS-side) AND raw attribute string (WebKit-side).
  // removeProperty fully clears !important; setAttribute string-edit handles the bypass case.
  const rafFix = () => {
    document.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
      if (el.style.getPropertyPriority('display') === 'important') {
        el.style.removeProperty('display');
      }
      const attr = el.getAttribute('style');
      if (attr && /display\s*:\s*none\s*!\s*important/i.test(attr)) {
        const fixed = attr.replace(/display\s*:\s*none\s*!\s*important\s*;?\s*/gi, '').trim();
        if (fixed) {
          origSetAttr.call(el, 'style', fixed);
        } else {
          el.removeAttribute('style');
        }
      }
    });
    requestAnimationFrame(rafFix);
  };
  requestAnimationFrame(rafFix);
}());

reportWebVitals();

createRoot(rootElement).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
