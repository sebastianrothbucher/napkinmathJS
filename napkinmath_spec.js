/* 
   Licensed under the Apache License, Version 2.0 (the "License"); you may not
   use this file except in compliance with the License. You may obtain a copy of
   the License at
  
     http://www.apache.org/licenses/LICENSE-2.0
  
   Unless required by applicable law or agreed to in writing, software 
   distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
   License for the specific language governing permissions and limitations under
   the License. 
*/
describe("NapkinmathJS base suite", function(){
  describe("Recognition", function(){
    var oldSolveTerm, terms;
    beforeEach(function(){
      oldSolveTerm=solveTerm;
      terms=[];
      solveTerm=function(term){
        terms.push(term);
        return "##res##";
      };
    });
    afterEach(function(){
      solveTerm=oldSolveTerm;
    });
    it("Recognizes Formulas on key", function(){
      var fakeArea={
        "selectionStart": 5,
        "selectionEnd": 5,
        "value": "2+2= "
      };
      napkinHandlerImpl(fakeArea);
      expect(terms.length).toBe(1);
      expect(terms[0]).toBe("2+2");
      expect(fakeArea.value).toBe("2+2=##res## ");
    });
    it("Recognizes Formulas on key in the middle", function(){
      var fakeArea={
        "selectionStart": 5,
        "selectionEnd": 5,
        "value": "2+2=\nsome more"
      };
      napkinHandlerImpl(fakeArea);
      expect(terms.length).toBe(1);
      expect(terms[0]).toBe("2+2");
      expect(fakeArea.value).toBe("2+2=##res##\nsome more");
    });
    it("Recognizes Formulas on key without range", function(){
      var fakeInput={
        "value": "2+2="
      };
      napkinHandlerNoRangeImpl(fakeInput);
      expect(terms.length).toBe(1);
      expect(terms[0]).toBe("2+2");
      expect(fakeInput.value).toBe("2+2=##res##");
    });
  });
  describe("Calcution", function(){
    it("Solves simple terms", function(){
      expect(solveTerm("2+2")).toBeCloseTo(4);
    });
    it("Solves simple terms with precedence", function(){
      expect(solveTerm("2+2*3")).toBeCloseTo(8);
    });
    it("Solves simple terms with brackets", function(){
      expect(solveTerm("(2+2)*3")).toBeCloseTo(12);
    });
    it("Solves simple terms with precedence and brackets", function(){
      expect(solveTerm("(2+2*3)*4")).toBeCloseTo(32);
    });
  });
});
