//
// my fetch functions
// ref: https://github.com/d3/d3-fetch

export const text = (input, init) => {
    return fetch(input, init).then((response) => {
        if (!response.ok) throw new Error(response.status + " " + response.statusText);
        return response.text();
    });
}

export const json = (input, init) => {
    return fetch(input, init).then((response) => {
        if (!response.ok) throw new Error(response.status + " " + response.statusText);
        return response.json();
    });
}