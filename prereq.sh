#!bash
## Licensed under the Apache License, Version 2.0 (the "License"); you may not
## use this file except in compliance with the License. You may obtain a copy of
## the License at
##
##   http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
## WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
## License for the specific language governing permissions and limitations under
## the License.

if [ ! -f jasmine/jasmine-standalone.zip ]; then
	echo "need jasmine-standalone.zip"
	curl -X GET -L -o jasmine/jasmine-standalone.zip https://github.com/jasmine/jasmine/releases/download/v2.0.0/jasmine-standalone-2.0.0.zip
        unzip jasmine/jasmine-standalone -d jasmine/
fi

