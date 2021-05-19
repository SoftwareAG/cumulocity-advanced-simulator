import { Injectable } from '@angular/core';
import { NavigatorNode, NavigatorNodeFactory, _ } from '@c8y/ngx-components';

@Injectable()
export class NavFactory implements NavigatorNodeFactory {
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
      label: _('Simulators'),
      icon: 'rocket',
      path: '/hello',
      priority: 100
    }));
    
    return nav;
  }
}
