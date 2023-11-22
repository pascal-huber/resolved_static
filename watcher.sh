#!/bin/bash

build_project(){
  echo "building project"
  yarn build
  if [ $? = 0 ]; then
    notify-send -t 5000 "build success"
  else
    notify-send -t 5000 -u critical "build failed"
  fi
}

build_project

while inotifywait -r -e close_write,moved_to,create,delete ./content ./src ; do
  build_project;
done

notify-send -t 5000 -u critical "build script exit"
