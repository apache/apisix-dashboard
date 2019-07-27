git clone https://github.com/iresty/apisix_dashboard_built.git && \
echo ">>>>> git clone successfully" && \
/bin/cp -a ./dist/. ./apisix_dashboard_built && \
echo ">>>>> cp dist to built successfully" && \
cd ./apisix_dashboard_built && \
git config --global user.name ${GIT_USER} && \
git config --global user.email ${GIT_MAIL} && \
git add * && \
git commit -m "Automatically update from travis-ci" && \
git push "https://${GH_USER}:${GH_PWD}@github.com/iresty/apisix_dashboard_built.git" master:master
echo ">>>>> git push successfully" && \