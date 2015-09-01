#### Abstract imperative code...

```javascript

function getTodos () {
  dispatch(SET_LOADING_TODOS);
  fetch('/todos')
    .then(function (todos) {
      dispatch(UNSET_LOADING_TODOS);
      dispatch(SET_TODOS, todos);
    })
    .catch(function (error) {
      dispatch(UNSET_LOADING_TODOS);
      dispatch(SET_TODOS_ERROR, error);
    });
}
```
