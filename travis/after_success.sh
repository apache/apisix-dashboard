#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
git clone https://github.com/iresty/apisix_dashboard_built.git && \
echo ">>>>> git clone successfully" && \
cd ./apisix_dashboard_built && \
git rm . -r && \
cd ../dist && \
for file in $(find . -type f \( -iname \*.js -o -iname \*.css \)); do
  if [[ "$file" != *"service-worker.js" ]]; then
    echo Processing $file
    cat ../travis/license $file > $file.modified
    mv $file.modified $file
  fi
done
cd .. && \
/bin/cp -a ./dist/. ./apisix_dashboard_built && \
/bin/cp ./LICENSE ./apisix_dashboard_built/LICENSE && \
echo ">>>>> cp dist to built successfully" && \
cd ./apisix_dashboard_built && \
git config --global user.name ${GIT_USER} && \
git config --global user.email ${GIT_MAIL} && \
git add * && \
git commit -m "${TRAVIS_COMMIT:0:8}: ${TRAVIS_COMMIT_MESSAGE}" && \
git push "https://${GH_USER}:${GH_PWD}@github.com/iresty/apisix_dashboard_built.git" master:master
echo ">>>>> git push successfully" && \