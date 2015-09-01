#### ...to functional signals!

```javascript

signal('appMounted',
  setLoadingTodos,
  [
    get('/todos'), {
      success: [setTodos],
      error: [setTodosError]
    }
  ],
  unsetLoadingTodos
);
```
