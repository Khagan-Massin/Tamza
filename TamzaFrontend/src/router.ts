export class Router {
    private routes: { [key: string]: (params: any) => void } = {};

    constructor() {
        window.onpopstate = () => this.routeChanged();
        window.onload = () => this.routeChanged();
    }

    addRoute(route: string, action: (params: any) => void) {
 
        this.routes[route] = action;
    }

    navigate(route: string) {
        window.history.pushState(null, '', route);
        this.routeChanged();
    }

    routeChanged() {
        const route = window.location.pathname;
        const routeParts = route.split('/');
        const action = this.routes[routeParts[1]];

        if (action) {
            const params = this.getQueryParams();
            action(params);
        } else {
            console.log('No action defined for route', route);
        }
    }

    getQueryParams() {
        const params: { [key: string]: string } = {};
        const queryString = window.location.search.substring(1);
        const queries = queryString.split('&');

        queries.forEach((query) => {
            const [key, value] = query.split('=');
            params[key] = decodeURIComponent(value);
        });

        return params;
    }
}

 

 