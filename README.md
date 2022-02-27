# feature

- show each path
- show diff with the previous path

## version1.0

- display unit: path
- no path2 yet, just display each path1 from read from path_file

# input

- graph_file: tve format 

  ```
  t n m
  v id label ...
  ...
  e s t ...
  ...
  ```

- path_file: (vij is vertex id)

  ```
  s v01 v02 ... t
  s v11 v12 ... t
  ...
  ```

# usage

## run

under demo dir

```bash

npm start
```

## button

- upload graph_file
- upload path_file
- next_path
- pre_path

# future plan

- support direct connection from path_searching_engine to UI