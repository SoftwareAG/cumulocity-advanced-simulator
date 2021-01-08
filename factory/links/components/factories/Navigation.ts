import { Injectable } from '@angular/core';
import { NavigatorNode, NavigatorNodeFactory, _ } from '@c8y/ngx-components';

@Injectable()
export class NavigationFactory implements NavigatorNodeFactory {
  // Implement the get()-method, otherwise the ExampleNavigationFactory
  // implements the NavigatorNodeFactory interface incorrectly (!)
  get() {
    const nav: NavigatorNode[] = [];

    /**
     * mandantory for a NavigatorNode is:
     *  - label (string)
     *  - path (string)
     * A click on the NavigatorNode will load the given path and therefore angular loads the
     * specified component (check: ../app.modules.ts)
     */
    nav.push(new NavigatorNode({
      label: _('Links'),
      icon: 'rocket',
      path: '/hello',
      priority: 100
    }));
    nav.push(new NavigatorNode({
      label: _('Devices'),
      icon: 'c8y-device',
      path: '/devices',
      priority: 97,
      routerLinkExact: false
    }));
    return nav;
  }
}
