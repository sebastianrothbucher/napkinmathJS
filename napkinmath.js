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
var napkinHandler=function(){
  // to reliably get a selection, process all events first
  setTimeout(napkinHandlerImpl);
};
var napkinHandlerImpl=function(){
  if(t.selectionStart!=t.selectionEnd){
    // we don't care about actual selection, just typing
    console.log("ignore range sel");
    return;
  }
  if(t.selectionStart<2){
    // too little for anything
    console.log("too little for anything");
    return;
  }
  // when we're one whitespace after a =, we can try
  var cursorPos=t.selectionStart;
  // console.log(cursorPos);
  var m=t.value.substring(0, cursorPos).match(/([^ ]*)=\s$/);
  if(!m){
    // - otherwise: not
    console.log("Not after formula=");
    return;
  }
  // hey: we can try actually!
  var formula=m[1];
  console.log("Giving it a shot 4 '"+formula+"'");
  var res=solveTerm(formula);
  console.log("Yeah! - we have '"+res+"', insert it.");
  var oldValue=t.value;
  var newValue=oldValue.substring(0, cursorPos-1)+(""+res)+oldValue.substring(cursorPos-1);
  t.value=newValue;
  t.selectionStart=cursorPos+(""+res).length;
  t.selectionEnd=cursorPos+(""+res).length;
};
/* ----- parse the term -----
   ex: 
   0: 4+(2+3*(10+1))*5+1*7+6
   1: [4+] [2+3*[10+1]] [*5+1*7+6] // by bracket
   1a: [4+] [2+3*11] [*5+1*7+6] // brackets inside-out (just like outer)
   1a: [4+] [35] [*5+1*7+6] // brackets inside-out (just like outer)
   1c: re-unite [4+35*5+1*7+6]
   2a: [4]+[35*5+1*7+6] // chop by low-precedence (solve as indep. terms like outer)
   2b: when no low-prec is left (like in 35*5 - or in 6), take next-higher
   2c: result [4]+[175+7+6]
   2d: 192 // only numbers - resolve this operator
   -------------------------- */
var solveTerm=function(term, logIndent){
  logIndent=(logIndent || 0); // (just default)
  console.log(("  ".repeat(logIndent))+"Trying 2 resolve '"+term+"'");
  // first: factor out brackets - and solve those recursively
  var bpos;
  var anyBracket=false;
  while((bpos=term.indexOf("("))>=0){
    // find the closing bracket matching the opening one
    var opn=0;
    var cpos=bpos+1;
    var found=false;
    while(cpos<term.length){
      if("("==term.substring(cpos, cpos+1)){
        // another opening bracket
        opn++;
      }else if(")"==term.substring(cpos, cpos+1)){
        if(opn>0){
          // another closing one - but not there
          opn--;
        }else{
          // we have it: we've singled out a bracket and can resolve it
          found=true;
          var subTerm=term.substring(bpos+1, cpos);
          console.log(("  ".repeat(logIndent))+"Resolving sub-term '"+subTerm+"'");
          var subRes=solveTerm(subTerm, logIndent+1);
          // build a new term so far
          var newTerm=term.substring(0, bpos);
          // then with bracket resolved
          newTerm+=subRes;
          // remainder
          newTerm+=term.substring(cpos+1);
          // and work with term
          term=newTerm;
          anyBracket=true;
          console.log(("  ".repeat(logIndent))+"Another bracket resolve to '"+term+"'");
          break; // continue w/ outer loop
        }
      }
      cpos++;
    }
    if(!found){
      throw "Missing closing bracket in '"+term+"'";
    }
  }
  if(anyBracket){
    console.log(("  ".repeat(logIndent))+"After bracket resolve we have '"+term+"'");
  }
  // now chop up by operators - start with low
  var ops=["+", "-", "*", "/"];
  for(var i=0; i<ops.length; i++){
    var op=ops[i];
    var opIndex=term.indexOf(op);
    if(0==opIndex){
      throw "Can't start with operator at '"+term+"'";
    }else if(opIndex>0){
      // chop up here and evaluate both sides, return result
      var leftTerm=term.substring(0, opIndex);
      var rightTerm=term.substring(opIndex+1);
      console.log(("  ".repeat(logIndent))+"Chopping up into '"+leftTerm+"' and '"+rightTerm+"'");
      var leftRes=solveTerm(leftTerm, logIndent+1);
      var rightRes=solveTerm(rightTerm, logIndent+1);
      var combinedRes;
      if("+"==op){
        combinedRes=leftRes+rightRes;
      }else if("-"==op){
        combinedRes=leftRes-rightRes;
      }else if("*"==op){
        combinedRes=leftRes*rightRes;
      }else if("/"==op){
        combinedRes=leftRes/rightRes;
      }else{
        throw "Unknown operator '"+op+"'";
      }
      console.log(("  ".repeat(logIndent))+"Solved '"+leftRes+"' '"+op+"' '"+rightRes+"' to '"+combinedRes+"'");
      return combinedRes;
    }else{
      // nothing, continue with next operator
    }
  }
  // when we're here, there is no operator left, i.e. we have a result
  return parseFloat(term);
};
