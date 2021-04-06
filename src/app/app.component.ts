import { Component } from '@angular/core';

interface recordSection
{
  startTime:number;
  duration:number;
  sourceIndex:number;
  sample:HTMLAudioElement;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'LoopMachine';
  isPlayOn: boolean = false;
  isRecordOn: boolean = false;
  isRecordOccurred:boolean = false;
  loopTimeout: any;
  pads= [
    {check: false, source: new Audio("..\\assets\\samples\\120_future_funk_beats_25.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\120_stutter_breakbeats_16.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\Bass Warwick heavy funk groove on E 120 BPM.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\electric guitar coutry slide 120bpm - B.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\FUD_120_StompySlosh.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\GrooveB_120bpm_Tanggu.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\MazePolitics_120_Perc.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\PAS3GROOVE1.03B.mp3"), startTime:0, duration:0, isPlaying: false},
    {check: false, source: new Audio("..\\assets\\samples\\SilentStar_120_Em_OrganSynth.mp3"), startTime:0, duration:0, isPlaying: false}
  ];
  turnedOnPadsIndexes: number[] = [];
  record: recordSection[] = [];
  recordStartTime: number = 0;
  

  ngOnInit(){
    let savedRecord = sessionStorage.getItem("record");

    if(savedRecord != null && savedRecord != "undefined")
    {
      this.showComponentById("playRecordButton");
      this.record = JSON.parse(savedRecord) as recordSection[];
    }
  }

  playSamples(){
    for(let i = 0; i< this.turnedOnPadsIndexes.length; i++)
    {
      this.pads[this.turnedOnPadsIndexes[i]].source.load();
      this.pads[this.turnedOnPadsIndexes[i]].source.play();
      this.pads[this.turnedOnPadsIndexes[i]].isPlaying = true;
      
      if(this.isRecordOn)
      {
        this.pads[this.turnedOnPadsIndexes[i]].startTime = Date.now();
      }
    }

    this.loopTimeout = setTimeout(()=>
    {//play the samples in loop
      if(this.turnedOnPadsIndexes.length > 0)
        {
          this.addSamplesToRecord();
          this.playSamples();
        }
    },8000)
  }

  addSamplesToRecord(){
    for(let i = 0; i<this.turnedOnPadsIndexes.length; i++)
    {
      if(this.pads[this.turnedOnPadsIndexes[i]].isPlaying)
      {
        this.record.push({startTime:this.pads[this.turnedOnPadsIndexes[i]].startTime-this.recordStartTime,
         duration: 8000, sourceIndex: this.turnedOnPadsIndexes[i],
          sample: this.pads[this.turnedOnPadsIndexes[i]].source})
      }
    }
  }

  padClicked(padIndex:number){
    let pad = this.pads[padIndex];

    pad.check = !pad.check// switch pad status
    this.changePadPress(padIndex);

    if(pad.check)
    {//pad is on
      this.turnedOnPadsIndexes.push(padIndex);
      if(this.isPlayOn && this.turnedOnPadsIndexes.length == 1)
      {//there is no playing samples
        clearTimeout(this.loopTimeout);
        this.playSamples();
      }
    }

    else
    {//pad is off
      this.stopPlaySample(padIndex);
    }
  }

  changePadPress(padIndex:number){
    if(this.pads[padIndex].check)
    {
        document.getElementById("pad" + padIndex)?.classList.replace("unpressedPad", "pressedPad");
    }

    else
    {
        document.getElementById("pad" + padIndex)?.classList.replace("pressedPad", "unpressedPad");
    }
  }

  stopPlaySample(padIndex: number){
    for(let i = 0; i< this.turnedOnPadsIndexes.length; i++)
    {
      if(this.turnedOnPadsIndexes[i] == padIndex)
      {//search the value that equal to the pad index
        let selectedPad = this.pads[this.turnedOnPadsIndexes[i]];

        if(this.pads[this.turnedOnPadsIndexes[i]].isPlaying)
        {
        selectedPad.source.pause();//stop the sample
        selectedPad.check = false;// uncheck the pad
        selectedPad.isPlaying = false;
          this.record.push({startTime: selectedPad.startTime-this.recordStartTime,
            duration: Date.now()-selectedPad.startTime, sourceIndex: padIndex,
          sample: this.pads[this.turnedOnPadsIndexes[i]].source})//add section to record array
        }

        this.turnedOnPadsIndexes.splice(i,1);
        break;
      }
    }
  }

  buttonPlayClicked(){
    if(!this.isPlayOn)
    {
      this.changeClassesByButtomPlay()
      this.changeButtonsDisabilityById(true, "recordButton", "playRecordButton");

      this.recordStartTime = Date.now();
      this.isPlayOn = true;
    }

    clearTimeout(this.loopTimeout);//clear the loop from last session (if had one)
    this.playSamples();

    if(this.isRecordOn)
    {
      this.changeButtonsDisabilityById(true, "playButton");
    }
  }

  changeClassesByButtomPlay(){
    document.getElementById("playButton")?.classList.replace("playButton","playButtonPlaying");
    document.getElementById("stopButton")?.classList.replace("stopButtonStopping","stopButton");
  }

  buttonStopClicked(){
    this.changeButtonsDisabilityById(false, "recordButton", "playRecordButton","playButton");
    this.changeClassesByButtonStop();

    while(this.turnedOnPadsIndexes.length > 0)
    {//turning off all active samples
      this.stopPlaySample(this.turnedOnPadsIndexes[0]);
    }
    
    clearTimeout(this.loopTimeout);
    this.isPlayOn = false;

    if(this.isRecordOn)
    {
      this.isRecordOn = !this.isRecordOn;

      this.stopRecord();
      this.saveRecord();
    }
  }

  changeButtonsDisabilityById(disabled:boolean, ...buttonsIds:string[]){
    for(let i =0; i<buttonsIds.length; i++)
    {
      (document.getElementById(buttonsIds[i]) as HTMLButtonElement).disabled = disabled;
  
      if(disabled)
      {
        (document.getElementById(buttonsIds[i]) as HTMLButtonElement).style.opacity = "50%";  
      }
  
      else
      {
        (document.getElementById(buttonsIds[i]) as HTMLButtonElement).style.opacity = "100%";
      }
    }
  }

  changeClassesByButtonStop(){
    document.getElementById("playButton")?.classList.replace("playButtonPlaying","playButton");
    document.getElementById("stopButton")?.classList.replace("stopButton","stopButtonStopping");

    this.turnedOnPadsIndexes.forEach(padIndex =>
    {
      document.getElementById("pad" + padIndex)?.classList.replace("pressedPad", "unpressedPad");
    });

    if(this.isRecordOn)
    {
      document.getElementById("recordButton")?.classList.replace("recordButtonRecording", "recordButton");
    }
  }

  buttonRecordClicked(){
    this.isRecordOn = !this.isRecordOn; //switch record status
    this.changeClassesByButtomRecording();
    
    if(this.isRecordOn)
    {
      this.hideComponentById("playRecordButton");
      this.startRecord();
    }
  }

  hideComponentById(componentId:string){
    document.getElementById(componentId)?.classList.add("displayed");
  }

  changeClassesByButtomRecording(){
    if(this.isRecordOn)
    {
      document.getElementById("recordButton")?.classList.replace("recordButton", "recordButtonRecording");
    }

    else
    {
      document.getElementById("recordButton")?.classList.replace("recordButtonRecording","recordButton");
    }
  }

  startRecord(){
    this.record = [];
  }

  stopRecord(){
    if(this.record.length>0)
    {
      this.isRecordOccurred = true;
      this.showComponentById("playRecordButton");
    }
  }

  saveRecord(){
    let recordJson = JSON.stringify(this.record);

    sessionStorage.setItem("record",recordJson);
  }

  showComponentById(...componentsIds:string[]){
    for(let i = 0; i< componentsIds.length; i++)
    {
      document.getElementById(componentsIds[i])?.classList.remove("displayed");
    }
  }

  buttonPlayRecordClicked(){    
    if(!this.isRecordOccurred)
    {
      this.fillSavedRecordAudio()
    }

      this.changeClassesByButtomPlayRecord(true);
      this.changeAllElementsDisabilityOnRecordPlaying(true)
    
      this.playRecord();
  }

  fillSavedRecordAudio()
  {
    for(let i = 0; i<this.record.length; i++){
      this.record[i].sample = this.pads[this.record[i].sourceIndex].source;
    }
  }

  changeClassesByButtomPlayRecord(isRecordPlayingOn:boolean){//change play record button color
    if(isRecordPlayingOn)
    {
      document.getElementById("playRecordButton")?.classList.replace("playRecordButton","playRecordButtonPlaying");
      document.getElementById("stopButton")?.classList.replace("stopButtonStopping", "stopButton");
    }
    
    else
    {
      document.getElementById("playRecordButton")?.classList.replace("playRecordButtonPlaying", "playRecordButton");
    }
  }

  changeAllElementsDisabilityOnRecordPlaying(disabilityState:boolean){
    let pads = document.getElementsByClassName("pad");
    for(let i =0; i<pads.length; i++)
    {
      (pads.item(i) as HTMLButtonElement).disabled = disabilityState;
    }

    (document.getElementById("playButton") as HTMLButtonElement).disabled = disabilityState;
    (document.getElementById("recordButton") as HTMLButtonElement).disabled = disabilityState;
    (document.getElementById("stopButton") as HTMLButtonElement).disabled = disabilityState;
    (document.getElementById("playRecordButton") as HTMLButtonElement).disabled = disabilityState;

    if(disabilityState)
    {
      (document.getElementById("playButton") as HTMLButtonElement).style.opacity = "50%";
      (document.getElementById("recordButton") as HTMLButtonElement).style.opacity = "50%";
      (document.getElementById("stopButton") as HTMLButtonElement).style.opacity = "50%";
    }
    
    else
    {
      (document.getElementById("playButton") as HTMLButtonElement).style.opacity = "100%";
      (document.getElementById("recordButton") as HTMLButtonElement).style.opacity = "100%";
      (document.getElementById("stopButton") as HTMLButtonElement).style.opacity = "100%";
    }
  }

  playRecord(){
    let isLastSample = false;

    for(let i =0; i<this.record.length; i++)
    {
      if(i == this.record.length-1)
      {
        isLastSample = true;
      }

      this.playSampleAfterMS(this.record[i].sample, this.record[i].startTime, this.record[i].sourceIndex);
      if(this.record[i].duration != 8000)
      {//the sample need to be pause after 'start time'+'duration' ms
        this.stopSampleAfterMS(this.record[i].sample, this.record[i].startTime + this.record[i].duration, isLastSample, this.record[i].sourceIndex);
      }
    }
  }

  stopSampleAfterMS(sample:HTMLAudioElement, stopTimer:number, isLast:boolean, padIndex:number){
    setTimeout(() => 
    {
      sample.pause();
      this.pads[padIndex].check = false;
      this.changePadPress(padIndex);

      if(isLast)
      {
        this.changeClassesByButtomPlayRecord(false);
        this.changeAllElementsDisabilityOnRecordPlaying(false);
        this.unpressPads();
      }
    }, stopTimer);
  }

  unpressPads(){
    for(let i = 0; i< this.pads.length; i++)
    {
      document.getElementsByClassName("pad").item(i)?.classList.replace("pressedPad", "unpressedPad");
    }
  }

  playSampleAfterMS(sample:HTMLAudioElement, delayTime:number, padIndex:number){
    setTimeout(() =>
    {
      sample.load();
      sample.play();
      this.pads[padIndex].check = true;
      this.changePadPress(padIndex);
    },delayTime)
  }
}