# # Copyright 2023 Google LLC
# #
# # Licensed under the Apache License, Version 2.0 (the "License");
# # you may not use this file except in compliance with the License.
# # You may obtain a copy of the License at
# #
# #     http://www.apache.org/licenses/LICENSE-2.0
# #
# # Unless required by applicable law or agreed to in writing, software
# # distributed under the License is distributed on an "AS IS" BASIS,
# # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# # See the License for the specific language governing permissions and
# # limitations under the License.

from unittest.mock import patch
import unittest
from google.cloud import storage
from main import list_bucket_object_names

class TestMethods(unittest.TestCase):

    def setUp(self):
        self.vision_api_method = "vqa"
        self.image_bucket = "cloud-samples-data"
        self.image_file = "vision/eiffel_tower.jpg"
        self.vqa_question = "What is this"
        self.vqa_num_results = 3

        # Given
        self.test_json = ('{' +
            '"vision_api_method": "{}",'.format(self.vision_api_method) +
            '"image_bucket": "{}",'.format(self.image_bucket) +
            '"image_file": "{}",'.format(self.image_file) +
            '"vqa_question": "{}",'.format(self.vqa_question) +
            '"vqa_num_results": {}'.format(self.vqa_num_results) +
        '}\n')

        self.expected_parse = (
            self.vision_api_method,
            self.image_bucket,
            self.image_file,
            self.vqa_question,
            self.vqa_num_results
        )

    @unittest.mock.patch('main.storage.Client')
    def test_list_bucket_object_names(self,mock_client):
        mock_client().list_blobs.return_value = [storage.Blob("blob1","path"),storage.Blob("blob2","path")]
        results = list_bucket_object_names("path")
        assert len(results) == 2
        
if __name__ == '__main__':
    unittest.main()