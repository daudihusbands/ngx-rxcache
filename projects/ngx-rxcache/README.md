# RxCache

RxCache is a light weight RxJs Behavior Subject based cache. It offers simple to grasp ways of achieving push based data flow to your components with hardly any boiler plate code at all.

[Testbed on StackBlitz](https://stackblitz.com/edit/angular-3yqpfe)

[A simple user management example with RxCache](https://stackblitz.com/edit/angular-jxqaiv)

[A redo of the official ngrx example app can be seen here on StackBlitz](https://stackblitz.com/edit/github-tsrf1f)

## Usage

npm install --save ngx-rxcache

Inject the service into your service.

```javascript
import { Injectable } from '@angular/core';
import { RxCacheService, RxCacheItem } from 'ngx-rxcache';

@Injectable()
export class YourService {
  constructor(public cache: RxCacheService) {
    this.item = cache.get<YourType>({ id: 'key', construct: functionThatReturnsObservableOfYourType });
    // or
    this.item = cache.get<YourType>({ id: 'key', initialValue : instanceOfYourType });
  }

  item: RxCacheItem<any>;

  data$ = this.item.value$;

  update = (value) => { this.item.update(value); };
}
```
The cache has methods for configuring, retrieving, checking for the existence of and deleting items. It also has methods for setting the global error message and handler.

A cache item is a simple light weight object that consists of an instance behaviour subject and optional behaviour subjects to signify the loading, loaded, saving, saved, and error states the item may be in.

```javascript
const item = cache.get('key');
```
Will retrieve an existing item from the cache or create a new one if one is not found.

```javascript
const exists = cache.exists('key');
```
Returns a boolean the check if an item with that key exists in the cache.

```javascript
cache.delete('key');
```
Will delete the item from the cache, complete all behaviour subjects and unsubscribe from the construct function.

```javascript
cache.genericError('An error has occoured');
```
Will set the global generic error message

```javascript
cache.errorHandler((key, error) => {
  logger.log(`Item with key '${key}' caused the error the error: ${error}`);
});
```
Will set the global generic error handler. If the error handler return a string it will be used as the error message for the error$ behaviour subject.

The get method can take in an object with the interface

```javascript
export interface RxCacheItemConfig<T> {
  id: string; // A unique string that is used to identify and retrive the item from the cache
  construct?: () => Observable<T>; // An optional constructor function that returns an observable of your type
  save?: (val: T) => Observable<any>; // An optional save function that saves the current instance
  saved?: (val: any) => void; // An optional save callback function that is called after the save method succeeds
  stringify?: (val: T) => any; // An optional function to transform the value before it is stringified for storage
  parse?: (val: any) => T; // An optional function to transform the value after it is parse from storage
  load?: boolean; // An optional flag to call the constructor function as soon as the item is created
  autoload?: boolean; // An optional flag to call the constructor function when the value$ accessor property is called if it is not already loaded
  localStorage?: boolean; // A optional flag to persist the value in localStorage to survive across browser sessions
  sessionStorage?: boolean; // An optional flag to persist the value in sessionStorage to survive browser refresh
  initialValue?: T; // An optional initial value for the item
  genericError?: string; // An optional generic error message to be returned on persist and construct failures
  errorHandler?: (id: string, error?: any) => string; // An error handler to be run on persist and construct failures, if it returns a string it will be used as the error message
}
```


```javascript
cache.get({ id: 'key' });
```
Will return a cache item that only has the instance behaviour subject initialised with it's value set to undefined.

```javascript
cache.get({ id: 'key', initialValue: 'Hello' });
```
Will return a cache item that only has the instance behaviour subject initialised with it's value set to a string 'Hello'.

```javascript
cache.get({ id: 'key', construct: () => of('Hello').pipe(delay(1000)) });
```
Will return a cache item that only has the instance behaviour subject initialised with it's value set to undefined. Once the load method is called the construct function will be called and the loading$ and loaded$ behaviour subjects will be initiased with true and false respectively. After the one second delay the instance behavior subject will be set to 'Hello', loading will be false and loaded will be true.

```javascript
cache.get({ id: 'key', construct: () => of('Hello').pipe(delay(1000)), load: true });
```
Will call the load function as the object is created. For the first second, instance is undefined, loading$ is true and loaded$ is false. Once the construct function is finished the instance is 'Hello', loading$ is false and loaded$ is true.

```javascript
cache.get({ id: 'key', construct: () => of('Hello').pipe(delay(1000)), autoload: true });
```
Will cause the load function to be called when the instance behaviour subject's accessor property value$ is acceessed if the item has not been loaded.

```javascript
cache.get({ id: 'key', construct: () => throwError('An error occoured')), load: true });
```
Will cause an error when constructing the object, the instance behaviour subject will be undefined, loading$ will be false, loaded$ will be false, hasError$ will be true and error$ will be 'An error has occoured', the global eneric error message.

```javascript
cache.get({ id: 'key', genericError: 'Oops', construct: () => throwError('An error occoured')), load: true });
```
Will cause an error when constructing the object, error$ will be 'Oops'.

```javascript
cache.get({ id: 'key', construct: () => throwError('An error occoured')), load: true, errorHandler: (id: string, error: any) => `Item with id '${id}' failed with the error: ${error}` });
```
Will cause an error when constructing the object, error$ will be "Item with id 'key' failed with the error: An error occoured".

## Persistence to localStorage and sessionStorage

```javascript
cache.get({ id: 'key', localStorage: true });
```
Will store the value in localStorage on every update so the value can survive between browser sessions

```javascript
cache.get({ id: 'key', sessionStorage: true });
```
Will store the value in sessionStorage on every update so the value can survive browser refresh

Some values such as dates do not persist well in sessionStorage and localStorage as they are turned into a string when JSON.stringify is used to turn the value into string for storage. There are two transformation functions that can be used to transform objects before being stringified and after being parsed.

```javascript
cache.get({
  id: 'key',
  stringify: (val) => ({ ...val, date: val.date.getTime() }),
  parse: (val) => ({ ...val, date: new Date(JSON.parse(val.date)) })
});
```
Will transform the value's date property into number of milliseconds before it is stringified for storage and transform the date property back to a date object after it is parsed from storage.

Using a parse function can cause unexpected behaviour if cache.get('key') is used before cache.get({id: 'key', parse: parseFunction }). When cache.get is called with a string for the key instead of a config object it will create one if it is not found. The constructor of the cache item object will instanciate with the value in local or session storage if the key matches a key in local or session storage. If then later cache.get is called with a config object that has a parse function the item will already have a value and the parse function will not run on value that was retrived from storage. This is the only case where the order of calling get with a string or config object matters. If you are using storage transformation functions you must make sure the cache.get(configObject) happens before cache.get(key) to gaurantee the stored value is parsed by the parse function.
