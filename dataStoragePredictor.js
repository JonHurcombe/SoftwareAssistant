var QUESTIONS_NODES = null;

$(document).ready(()=>{
    loadQuestions().then(questions => {
        QUESTIONS = $.csv.toObjects(questions);
        QUESTIONS = mapUserHeadersToCodeHeaders(QUESTIONS);
        QUESTIONS.forEach(item => {
            item.Answers = item.Answers.split('|');
            if (item.Answers.length && item.Answers[0] == "") item.Answers = [];
            item.Children = item.Children.split('|');
        })
    }).then(()=>{
        startChat(QUESTIONS_NODES);
    })
});

function mapUserHeadersToCodeHeaders(questions){
    return questions.map(x=>{
        return {
            "ID" : x["Node ID"],
            "Question" : x["Node Description"],
            "Answers" : x["Branch Description"],
            "Children" : x["Child Nodes (by ID)"]
        }
    });
}


function loadQuestions(){
    // return $.ajax({url:"Assets/data/questions.json"});
    return $.ajax({ url: "Assets/data/DataStorageDecisionTree.csv" })
}

function startChat(questionsNodes){
    $("#chatConvoContainer").html('');
    var questionNode = QUESTIONS.filter(x=>{return x.ID == "1"})
    if(questionNode.length != 1){ alert("Found nodes:", questionNode.length); return; }
    questionNode = questionNode[0];

    askQuestion(questionNode);
    suggestAnswers(questionNode);
}

function askQuestion(questionNode){
    $("#chatConvoContainer").append(`
        <div class="frame" data-questionNodeID="${questionNode.ID}">
            <div class="full">
                <div class="question_text"> 
                    ${questionNode.Question}
                </div>
            </div>
            <div class="question_arrow"></div>
        </div>
    `)
}

function suggestAnswers(questionNode){
    var rowNo = Math.ceil(questionNode.Answers.length/3);
    if(rowNo == 0){
        $("#chatReplyOptionsContainer").html('');
        return;
    }
    var ansArr = [];
    var childPointerArr = [];
    $.extend(true, ansArr, questionNode.Answers);
    $.extend(true, childPointerArr, questionNode.Children);
    
    var optionsContent = "";
    for(var i=0; i<rowNo; i++){
        var btnOptionClass;
        var btnPerRow = 0;
        // check if only 1, then set to 1.
        if(ansArr.length == 1)
            btnPerRow = 1
        else if(ansArr.length%3 == 0 ){
            // check if 3 items can be put in each row.
            if(ansArr.length%3 == 1)    // if mod result is 1 then put deafult 3
                btnPerRow = 3
            else
                btnPerRow = (ansArr.length%3) || 3; // we don't take 0 for an answer
        }else{
            // check if 2 items can be put in each row.
            if(ansArr.length%2 == 1)    // if mod result is 1 then put deafult 2
                btnPerRow = 2
            else
                btnPerRow = (ansArr.length%2) || 2; // we don't take 0 for an answer
        }

        switch(btnPerRow){
            case 1:
                btnOptionClass = "btn-options1";
                break;
            case 2:
                btnOptionClass = "btn-options2";
                break;
            case 3:
                btnOptionClass = "btn-options3";
                break;
            default:
                btnOptionClass = "btn-options1";
                break;
        }

        optionsContent += `<div class="row btn-optionRows">`;
        for(var j=0; j<btnPerRow; j++){
            optionsContent += `<div class="btn btn-sm btn-options ${btnOptionClass}" data-childNode="${childPointerArr[0]}">${ansArr[0]}</div>`;
            ansArr.splice(0,1);
            childPointerArr.splice(0,1);
            if(ansArr.length < 1 ) break;
        }
        optionsContent += `</div>`;
    }

    $("#chatReplyOptionsContainer").html(optionsContent);
}

function showUserAnswer(answerText){
    $("#chatConvoContainer").append(`
        <div class="frame">
            <div class="full">
                <div class="ans_text"> 
                    ${answerText}
                </div>
            </div>
            <div class="ans_arrow"></div>
        </div>
    `)
}


/* Listeners */

$(document).on('click','.btn-options', e=>{
    e.preventDefault();
    var childID = $(e.target).attr('data-childNode');
    var questionNode = QUESTIONS.filter(x=>{return x.ID == childID})
    if(questionNode.length != 1){ alert("Found nodes:", questionNode.length); return; }
    questionNode = questionNode[0];
    showUserAnswer($(e.target).text());
    askQuestion(questionNode);
    suggestAnswers(questionNode);
    $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
})


$(document).on('click','#btn-goToPreviousQuestion', e=>{
    e.preventDefault();
    // remove question
    $(".frame").last().remove();
    // remove answer
    $(".frame").last().remove();

    var prevQuestionID = $(".frame").last().attr("data-questionNodeID");
    var questionNode = QUESTIONS.filter(x=>{return x.ID == prevQuestionID})
    if(questionNode.length != 1){ alert("Found nodes:", questionNode.length); return; }
    questionNode = questionNode[0];
    suggestAnswers(questionNode);
    $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
});

$(document).on('click','#btn-restartChat', e=>{
    e.preventDefault();
    startChat(QUESTIONS_NODES);
});

$(document).on('click','#btn-loadJokeBot', e=>{
    e.preventDefault();
    $.ajax({url:"Assets/data/jokes.json"}).then(questions => {
        QUESTIONS = questions;
    }).then(()=>{
        startChat(QUESTIONS_NODES);
    })
});
